"""
stores/widgets.py

Custom AM/PM time picker widget for Django admin.
Renders three selects: Hour (1–12) | Minute (00–55) | AM/PM
Converts back to 24-hour HH:MM:SS that Django's TimeField expects.
"""
from django import forms
from django.utils.safestring import mark_safe


class AMPMTimeWidget(forms.Widget):
    """
    A composite widget that renders three <select> elements:
        hour  : 1 – 12
        minute: 00, 05, 10 … 55
        period: AM / PM
    value_from_datadict() converts the three parts back to 'HH:MM:00'
    so Django's TimeField can parse it normally.
    """

    # ── Decode stored value → (hour12, minute_str, period) ────────────────────
    @staticmethod
    def _parse(value):
        """Return (hour12:int, minute_str:'00'–'59', period:'AM'|'PM') from
        a time object, 'HH:MM', or 'HH:MM:SS' string. Returns None on failure."""
        if not value:
            return None

        try:
            if hasattr(value, 'hour'):          # datetime.time object
                h, m = value.hour, value.minute
            else:                               # string  'HH:MM' or 'HH:MM:SS'
                parts = str(value).split(':')
                h, m  = int(parts[0]), int(parts[1])

            period  = 'PM' if h >= 12 else 'AM'
            hour12  = h % 12 or 12
            return hour12, f'{m:02d}', period
        except (ValueError, IndexError, AttributeError):
            return None

    # ── Render ─────────────────────────────────────────────────────────────────
    def render(self, name, value, attrs=None, renderer=None):
        parsed  = self._parse(value)
        cur_h   = parsed[0] if parsed else 8
        cur_m   = parsed[1] if parsed else '00'
        cur_p   = parsed[2] if parsed else 'AM'

        # ── Build <option> lists ──────────────────────────────────────────────
        hour_opts = '\n'.join(
            f'<option value="{h}" {"selected" if h == cur_h else ""}>{h}</option>'
            for h in range(1, 13)
        )

        # 5-minute steps — covers any store opening/closing time in practice
        minute_opts = '\n'.join(
            f'<option value="{m:02d}" {"selected" if f"{m:02d}" == cur_m else ""}>{m:02d}</option>'
            for m in range(0, 60, 5)
        )

        am_sel = 'selected' if cur_p == 'AM' else ''
        pm_sel = 'selected' if cur_p == 'PM' else ''

        # ── Shared select style ───────────────────────────────────────────────
        sel = (
            'padding:6px 10px;'
            'border-radius:6px;'
            'border:1px solid #ccc;'
            'font-size:14px;'
            'background:#fff;'
            'color:#151e13;'
            'cursor:pointer;'
            'outline:none;'
        )
        period_extra = 'font-weight:700;color:#00694c;min-width:70px;'

        html = f"""
<div style="display:flex;align-items:center;gap:6px;">
  <select name="{name}_hour"   style="{sel}min-width:64px;">{hour_opts}</select>
  <span   style="font-weight:800;font-size:18px;color:#555;line-height:1;">:</span>
  <select name="{name}_minute" style="{sel}min-width:72px;">{minute_opts}</select>
  <select name="{name}_period" style="{sel}{period_extra}">
    <option value="AM" {am_sel}>AM</option>
    <option value="PM" {pm_sel}>PM</option>
  </select>
</div>"""
        return mark_safe(html)

    # ── Read POST data → '14:30:00' ────────────────────────────────────────────
    def value_from_datadict(self, data, files, name):
        hour_str   = data.get(f'{name}_hour',   '').strip()
        minute_str = data.get(f'{name}_minute', '00').strip()
        period     = data.get(f'{name}_period', 'AM').strip().upper()

        if not hour_str:
            return None

        try:
            h = int(hour_str)
            m = int(minute_str)
        except ValueError:
            return None

        # Convert 12-hour → 24-hour
        if period == 'PM' and h != 12:
            h += 12
        elif period == 'AM' and h == 12:
            h = 0

        return f'{h:02d}:{m:02d}:00'

    # ── Tell Django this widget sends its own sub-keys, not the bare name ──────
    def value_omitted_from_data(self, data, files, name):
        return f'{name}_hour' not in data