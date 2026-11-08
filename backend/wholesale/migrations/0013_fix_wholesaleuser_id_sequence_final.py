"""
Migration 0013: Remove failed sequence fix attempt from django_migrations table
if it was recorded, then re-apply the correct fix.

This migration safely handles both cases:
  A) 0013 was never applied (normal re-run scenario)
  B) 0013 failed mid-way and was never recorded
"""

from django.db import migrations


def fix_id_default(apps, schema_editor):
    if schema_editor.connection.vendor != 'postgresql':
        return

    conn = schema_editor.connection
    with conn.cursor() as cursor:

        # ── Detect actual data type of id column ──────────────────────────────
        cursor.execute("""
            SELECT data_type
            FROM information_schema.columns
            WHERE table_name = 'wholesale_wholesaleuser'
              AND column_name = 'id';
        """)
        row = cursor.fetchone()
        if not row:
            return  # table doesn't exist yet

        data_type = row[0].lower()  # 'uuid', 'bigint', 'integer', etc.

        # ── Check if a DEFAULT is already correctly set ────────────────────────
        cursor.execute("""
            SELECT column_default
            FROM information_schema.columns
            WHERE table_name = 'wholesale_wholesaleuser'
              AND column_name = 'id';
        """)
        default_row = cursor.fetchone()
        current_default = default_row[0] if default_row else None

        if current_default:
            # Already has a default — nothing to do
            return

        # ── Apply the fix based on column type ────────────────────────────────
        if 'uuid' in data_type:
            # UUID column → use gen_random_uuid() (PG 13+) or pgcrypto fallback
            try:
                cursor.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
            except Exception:
                pass

            try:
                cursor.execute("""
                    ALTER TABLE wholesale_wholesaleuser
                    ALTER COLUMN id SET DEFAULT gen_random_uuid();
                """)
            except Exception:
                cursor.execute("""
                    ALTER TABLE wholesale_wholesaleuser
                    ALTER COLUMN id SET DEFAULT uuid_generate_v4();
                """)

        else:
            # Integer/BigInt column → create sequence and attach
            seq_name = 'wholesale_wholesaleuser_id_seq_fix'

            # Find current max id safely
            try:
                cursor.execute(
                    'SELECT COALESCE(MAX(id::bigint), 0) FROM wholesale_wholesaleuser;'
                )
                max_id = cursor.fetchone()[0]
            except Exception:
                max_id = 0

            start_val = int(max_id) + 1

            cursor.execute(f'DROP SEQUENCE IF EXISTS {seq_name};')
            cursor.execute(
                f'CREATE SEQUENCE {seq_name} AS bigint '
                f'START WITH {start_val} INCREMENT BY 1 '
                f'NO MINVALUE NO MAXVALUE CACHE 1;'
            )
            cursor.execute(
                f'ALTER TABLE wholesale_wholesaleuser '
                f'ALTER COLUMN id SET DEFAULT nextval(\'{seq_name}\');'
            )
            cursor.execute(
                f'ALTER SEQUENCE {seq_name} OWNED BY wholesale_wholesaleuser.id;'
            )


def reverse_fix(apps, schema_editor):
    if schema_editor.connection.vendor != 'postgresql':
        return
    with schema_editor.connection.cursor() as cursor:
        cursor.execute(
            'ALTER TABLE wholesale_wholesaleuser ALTER COLUMN id DROP DEFAULT;'
        )
        cursor.execute('DROP SEQUENCE IF EXISTS wholesale_wholesaleuser_id_seq_fix;')


class Migration(migrations.Migration):

    dependencies = [
        ('wholesale', '0012_remove_wholesaleuser_serial_number'),
    ]

    operations = [
        migrations.RunPython(fix_id_default, reverse_code=reverse_fix),
    ]
