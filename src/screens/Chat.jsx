import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useTrip } from '../data/TripContext'
import Avatar from '../components/Avatar'
import { fmtTime, fmtDateLong } from '../lib/format'

export default function Chat() {
  const { chat, memberById, uid, me, add, del } = useTrip()
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  const sorted = useMemo(
    () => [...chat].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    [chat]
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [sorted.length])

  async function send() {
    if (!text.trim()) return
    await add('chat', {
      userId: uid,
      userName: me?.displayName ?? '???',
      userAccent: me?.accentColor ?? null,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    })
    setText('')
  }

  let lastDay = null
  return (
    <div className="mx-auto flex h-dvh w-full max-w-3xl flex-col px-4 pt-4">
      <h1 className="font-display mb-2 text-3xl uppercase tracking-wide">Trip-Chat</h1>
      <div className="flex-1 space-y-2 overflow-y-auto pb-4">
        {sorted.map((m) => {
          const mine = m.userId === uid
          const member = memberById[m.userId]
          const day = m.createdAt?.slice(0, 10)
          const showDay = day !== lastDay
          lastDay = day
          return (
            <div key={m.id}>
              {showDay && (
                <p className="my-3 text-center text-[0.65rem] uppercase tracking-wide text-mist-500">
                  {fmtDateLong(m.createdAt)}
                </p>
              )}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-end gap-2 ${mine ? 'flex-row-reverse' : ''}`}
              >
                {!mine && (
                  <Avatar member={member ?? { displayName: m.userName, accentColor: m.userAccent, avatar: '🎣' }} size={28} />
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${mine ? 'rounded-br-md bg-pine-500/40' : 'rounded-bl-md bg-night-700'}`}
                >
                  {!mine && (
                    <p className="mb-0.5 text-xs font-bold" style={{ color: member?.accentColor ?? m.userAccent ?? 'var(--color-wood-400)' }}>
                      {member?.displayName ?? m.userName}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  <p className="mt-0.5 text-right text-[0.6rem] text-paper-100/40">{fmtTime(m.createdAt)}</p>
                </div>
                {mine && (
                  <button
                    onClick={() => del('chat', m.id)}
                    className="mb-1 text-[0.6rem] text-mist-500/40 hover:text-red-400"
                    aria-label="Nachricht löschen"
                  >
                    ✕
                  </button>
                )}
              </motion.div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 border-t border-paper-100/10 pb-24 pt-3">
        <input
          className="input-dark flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Nachricht… (geht auch offline raus)"
        />
        <button onClick={send} disabled={!text.trim()} className="btn-fire px-4">➤</button>
      </div>
    </div>
  )
}
