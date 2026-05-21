"""
Script to add HTMX attributes to all sidebar links
"""
import re

sidebar_path = r"C:\Users\iZoom10\Desktop\icommerce\backend\dashboard\templates\dashboard\partials\sidebar.html"

# Read the file
with open(sidebar_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to match links that don't already have hx-get
pattern = r'<a href="({% url[^}]+%})" class="menu-link">'

# Replacement with HTMX attributes
replacement = r'<a href="\1" class="menu-link" hx-get="\1" hx-target="#dashboard-content" hx-swap="innerHTML" hx-push-url="true">'

# Replace
updated_content = re.sub(pattern, replacement, content)

# Write back
with open(sidebar_path, 'w', encoding='utf-8') as f:
    f.write(updated_content)

print("✅ Successfully updated sidebar links with HTMX attributes")
