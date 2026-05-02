"use client"

import { useEffect, useState, useCallback } from 'react'
import styles from './statistics.module.css'

// ── helpers ───────────────────────────────────────────────────
function getRankClass(i) {
  if (i === 0) return styles.rankGold
  if (i === 1) return styles.rankSilver
  if (i === 2) return styles.rankBronze
  return ''
}

// ── StatCard ──────────────────────────────────────────────────
function StatCard({ icon, value, label, sub, accent }) {
  return (
    <div className={`${styles.card} ${accent ? styles.cardAccent : ''}`}>
      <div className={styles.cardIcon}>{icon}</div>
      <div className={styles.cardValue}>{value ?? '—'}</div>
      <div className={styles.cardLabel}>{label}</div>
      {sub && <div className={styles.cardSub}>{sub}</div>}
    </div>
  )
}

// ── Leaderboard row ───────────────────────────────────────────
function LeaderboardRow({ index, name, meta, badge }) {
  return (
    <div className={styles.listRow}>
      <div className={`${styles.rank} ${getRankClass(index)}`}>{index + 1}</div>
      <div className={styles.avatar}>{(name?.[0] ?? '?').toUpperCase()}</div>
      <div className={styles.listInfo}>
        <div className={styles.listName}>@{name}</div>
        {meta && <div className={styles.listSub}>{meta}</div>}
      </div>
      <div className={`${styles.badge} ${index < 3 ? styles.badgeAccent : ''}`}>
        {badge}
      </div>
    </div>
  )
}

// ── Leaderboard card ──────────────────────────────────────────
function Leaderboard({ icon, title, children }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span>{icon}</span>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.sectionLine} />
      </div>
      <div className={styles.listCard}>{children}</div>
    </section>
  )
}

// ── Horizontal bar chart ──────────────────────────────────────
function BarChart({ icon, title, rows }) {
  const max = Math.max(...rows.map(r => r.value), 1)
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span>{icon}</span>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.sectionLine} />
      </div>
      <div className={styles.barChart}>
        {rows.length === 0 && <div className={styles.empty}>No data yet.</div>}
        {rows.map((row, i) => (
          <div key={i} className={styles.barRow}>
            <div className={styles.barLabel} title={row.label}>{row.label}</div>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${Math.round((row.value / max) * 100)}%` }}
              />
            </div>
            <div className={styles.barCount}>{row.value}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Word cloud ────────────────────────────────────────────────
function WordCloud({ icon, title, words }) {
  const max = words[0]?.count ?? 1
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span>{icon}</span>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <div className={styles.sectionLine} />
      </div>
      <div className={styles.wordCloud}>
        {words.length === 0 && <div className={styles.empty}>No words yet.</div>}
        {words.map(({ word, count }) => {
          const size = Math.round(13 + 13 * (count / max))
          return (
            <span
              key={word}
              className={styles.wordPill}
              style={{ fontSize: `${size}px` }}
              title={`"${word}" used ${count} time${count !== 1 ? 's' : ''}`}
            >
              {word}
            </span>
          )
        })}
      </div>
    </section>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function StatisticsPage() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/statistics')
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      const data = await res.json()
      setStats(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  // ── destructure Member 3's exact response shape ───────────
  const overview          = stats?.overview          ?? {}
  const averages          = stats?.averages          ?? {}
  const topUsersByFollowers = stats?.topUsersByFollowers ?? []
  const mostActiveUsers   = stats?.mostActiveUsers   ?? []
  const topLikedPosts     = stats?.topLikedPosts     ?? []
  const topCommentedPosts = stats?.topCommentedPosts ?? []
  const topPostWords      = stats?.topPostWords      ?? []
  const topCommentWords   = stats?.topCommentWords   ?? []

  return (
    <div className={styles.page}>

      {/* ── Header ─────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <p className={styles.breadcrumb}>
            <a href="/">Home</a> / Statistics
          </p>
          <div className={styles.headerTop}>
            <div className={styles.headerIcon}>📊</div>
            <h1 className={styles.headerTitle}>Platform Statistics</h1>
          </div>
          <p className={styles.description}>
            Real-time metrics pulled from the database — engagement, influence, and content trends.
          </p>
        </div>
        <button
          className={styles.refreshButton}
          onClick={fetchStats}
          disabled={loading}
        >
          {loading ? '⏳ Refreshing…' : '🔄 Refresh'}
        </button>
      </header>

      {/* ── Loading ────────────────────────────────────────── */}
      {loading && (
        <div className={styles.statusMessage}>
          <div className={styles.spinner} />
          Loading statistics…
        </div>
      )}

      {/* ── Error ──────────────────────────────────────────── */}
      {!loading && error && (
        <div className={styles.statusMessage}>
          <span className={styles.errorText}>⚠️ {error}</span>
          <button className={styles.retryButton} onClick={fetchStats}>Retry</button>
        </div>
      )}

      {/* ── Content ────────────────────────────────────────── */}
      {!loading && !error && stats && (
        <main className={styles.content}>

          {/* ── Overview Cards ─────────────────────────────── */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span>🔢</span>
              <h2 className={styles.sectionTitle}>Overview</h2>
              <div className={styles.sectionLine} />
            </div>
            <div className={styles.cardsGrid}>
              <StatCard icon="👥" accent value={overview.totalUsers}    label="Total Users"    sub="Registered accounts" />
              <StatCard icon="📝"       value={overview.totalPosts}    label="Total Posts"    sub="Published content" />
              <StatCard icon="❤️"       value={overview.totalLikes}    label="Total Likes"    sub="Reactions given" />
              <StatCard icon="💬"       value={overview.totalComments} label="Total Comments" sub="Conversations" />
              <StatCard icon="🔗"       value={overview.totalFollows}  label="Total Follows"  sub="Connections made" />
              <StatCard icon="📈"       value={averages.avgFollowersPerUser != null ? Number(averages.avgFollowersPerUser).toFixed(1) : '—'} label="Avg Followers" sub="Per user" />
              <StatCard icon="✍️"       value={averages.avgPostsPerUser     != null ? Number(averages.avgPostsPerUser).toFixed(1)     : '—'} label="Avg Posts"     sub="Per user" />
              <StatCard icon="⭐"       value={averages.avgLikesPerPost     != null ? Number(averages.avgLikesPerPost).toFixed(1)     : '—'} label="Avg Likes"     sub="Per post" />
            </div>
          </section>

          {/* ── Most Followed ──────────────────────────────── */}
          <Leaderboard icon="🏆" title="Top Users by Followers">
            {topUsersByFollowers.length === 0 && <div className={styles.empty}>No data yet.</div>}
            {topUsersByFollowers.map((user, i) => (
              <LeaderboardRow
                key={user.id}
                index={i}
                name={user.username}
                badge={`${user.followers} followers`}
              />
            ))}
          </Leaderboard>

          {/* ── Most Active ────────────────────────────────── */}
          <Leaderboard icon="⚡" title="Most Active Users">
            {mostActiveUsers.length === 0 && <div className={styles.empty}>No data yet.</div>}
            {mostActiveUsers.map((user, i) => (
              <LeaderboardRow
                key={user.id}
                index={i}
                name={user.username}
                meta={`${user.posts} posts · ${user.comments} comments · ${user.likes} likes`}
                badge={`${user.activity} actions`}
              />
            ))}
          </Leaderboard>

          {/* ── Top Liked + Top Commented Posts ────────────── */}
          <div className={styles.twoCol}>
            <BarChart
              icon="❤️"
              title="Most Liked Posts"
              rows={topLikedPosts.map(p => ({
                label: p.content?.length > 30 ? p.content.slice(0, 30) + '…' : p.content,
                value: p.likes,
              }))}
            />
            <BarChart
              icon="💬"
              title="Most Commented Posts"
              rows={topCommentedPosts.map(p => ({
                label: p.content?.length > 30 ? p.content.slice(0, 30) + '…' : p.content,
                value: p.comments,
              }))}
            />
          </div>

          {/* ── Word Clouds ────────────────────────────────── */}
          <div className={styles.twoCol}>
            <WordCloud icon="🔤" title="Top Words in Posts"    words={topPostWords} />
            <WordCloud icon="💭" title="Top Words in Comments" words={topCommentWords} />
          </div>

        </main>
      )}
    </div>
  )
}
