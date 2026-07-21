export default function Avatar({ member, size = 40, ring = true }) {
  const s = { width: size, height: size }
  const color = member?.accentColor ?? '#9aa69b'
  if (member?.avatarUrl) {
    return (
      <img
        src={member.avatarUrl}
        alt={member.displayName}
        style={{ ...s, borderColor: ring ? color : 'transparent' }}
        className="shrink-0 rounded-full border-2 object-cover"
      />
    )
  }
  return (
    <div
      style={{ ...s, borderColor: ring ? color : 'transparent', background: `${color}22` }}
      className="flex shrink-0 items-center justify-center rounded-full border-2"
    >
      <span style={{ fontSize: size * 0.5 }}>{member?.avatar ?? '👤'}</span>
    </div>
  )
}
