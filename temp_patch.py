from pathlib import Path
path = Path('src/layouts/Topbar.jsx')
data = path.read_text(encoding='utf-8')
old = "// ── User (replace with auth context in production) ─────────────────────────────────────────────────────────────────────\nconst CURRENT_USER = {\n  name:     'Shailesh Bhange',\n  role:     'Admin',           // 'Admin' | 'Manager' | 'User'\n  initials: 'SB',\n};\n"
new = "// ── User helpers ──────────────────────────────────────────────────────────────────────────────────\nconst FALLBACK_USER = {\n  name:   'Shailesh Bhange',\n  role:   'Admin',\n  avatar: 'SB',\n};\n\nconst toInitials = (user) => {\n  if (!user) return 'US';\n  if (user.avatar) return user.avatar;\n  if (!user.name) return 'US';\n  return user.name\n    .split(' ')\n    .map((word) => word[0])\n    .join('')\n    .toUpperCase()\n    .slice(0, 2);\n};\n\nconst normalizeRoleLabel = (role) => {\n  if (!role) return 'User';\n  return role.charAt(0).toUpperCase() + role.slice(1);\n};\n"
if old not in data:
    raise SystemExit('old block not found')
path.write_text(data.replace(old, new, 1), encoding='utf-8')
