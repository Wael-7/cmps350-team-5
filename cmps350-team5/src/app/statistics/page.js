"use client"

import { useEffect, useState, useCallback } from 'react'
import styles from './statistics.module.css'

function StatCard({ icon, value, label, sub }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardIcon}>{icon}</div>
      <div className={styles.cardValue}>{value ?? '—'}</div>
      <div className={styles.cardLabel}>{label}</div>
      {sub && <div className={styles.cardSub}>{sub}</div>}
    </div>
  )
}

export default function StatisticsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/statistics')
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`)
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const overview = stats?.overview ?? {}
  const averages = stats?.averages ?? {}

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.breadcrumb}>
            <a href="/">Home</a> / Statistics
          </p>
          <h1>Platform Statistics</h1>
          <p className={styles.description}>
            Real-time metrics pulled from the app database for engagement, influence, and content trends.
          </p>
        </div>
        <button className={styles.refreshButton} onClick={fetchStats} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </header>

      {loading && (
        <div className={styles.statusMessage}>
          <div className={styles.spinner} />
          Loading statistics…
        </div>
      )}

      {error && !loading && (
        <div className={styles.statusMessage}>
          <span className={styles.errorText}>Error: {error}</span>
          <button className={styles.retryButton} onClick={fetchStats}>Retry</button>
        </div>
      )}

      {!loading && !error && stats && (
        <main className={styles.content}>
          <section className={styles.grid}>
            <StatCard icon="👥" value={overview.totalUsers} label="Total Users" sub="Registered accounts" />
            <StatCard icon="📝" value={overview.totalPosts} label="Total Posts" sub="Published posts" />
            <StatCard icon="❤️" value={overview.totalLikes} label="Total Likes" sub="Total reactions" />
            <StatCard icon="💬" value={overview.totalComments} label="Total Comments" sub="Conversation volume" />
            <StatCard icon="🔗" value={overview.totalFollows} label="Total Follows" sub="Network connections" />
            <StatCard icon="📈" value={averages.avgFollowersPerUser?.toFixed(1)} label="Avg Followers" sub="Per user" />
            <StatCard icon="✍️" value={averages.avgPostsPerUser?.toFixed(1)} label="Avg Posts" sub="Per user" />
            <StatCard icon="⭐" value={averages.avgLikesPerPost?.toFixed(1)} label="Avg Likes" sub="Per post" />
          </section>

          <section className={styles.section}>
            <h2>Top Users by Followers</h2>
            <ol className={styles.list}>
              {stats.topUsersByFollowers.map((user) => (
                <li key={user.id}>
                  <strong>{user.username}</strong>
                  <span>{user.followers} followers</span>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.section}>
            <h2>Most Active Users</h2>
            <ol className={styles.list}>
              {stats.mostActiveUsers.map((user) => (
                <li key={user.id}>
                  <strong>{user.username}</strong>
                  <span>{user.activity} actions ({user.posts} posts · {user.likes} likes · {user.comments} comments)</span>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.rowWrap}>
            <div className={styles.cardPanel}>
              <h2>Top Liked Posts</h2>
              <ol className={styles.postList}>
                {stats.topLikedPosts.map((post) => (
                  <li key={post.id}>
                    <p>{post.content}</p>
                    <small>{post.likes} likes · {post.comments} comments · by {post.author}</small>
                  </li>
                ))}
              </ol>
            </div>
            <div className={styles.cardPanel}>
              <h2>Top Commented Posts</h2>
              <ol className={styles.postList}>
                {stats.topCommentedPosts.map((post) => (
                  <li key={post.id}>
                    <p>{post.content}</p>
                    <small>{post.comments} comments · {post.likes} likes · by {post.author}</small>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className={styles.rowWrap}>
            <div className={styles.cardPanel}>
              <h2>Top Words in Posts</h2>
              <ol className={styles.list}>
                {stats.topPostWords.map((item) => (
                  <li key={item.word}>{item.word} · {item.count}</li>
                ))}
              </ol>
            </div>
            <div className={styles.cardPanel}>
              <h2>Top Words in Comments</h2>
              <ol className={styles.list}>
                {stats.topCommentWords.map((item) => (
                  <li key={item.word}>{item.word} · {item.count}</li>
                ))}
              </ol>
            </div>
          </section>
        </main>
      )}
    </div>
  )
}
