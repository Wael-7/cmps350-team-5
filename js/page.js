"use client";

import Link from "next/link";
import styles from "./statistics.module.css";

export default function StatisticsPage() {
  return (
    <div className={styles.page}>

      {/* ── Navbar ───────────────────────────────────────────── */}
      <nav className={styles.navbar}>
        <Link href="/" className={styles.navBrand}>
          <div className={styles.navLogo}>H</div>
          <span className={styles.navName}>Hive</span>
        </Link>
        <div className={styles.navLinks}>
          <a href="/feed.html" className={styles.navLink}>Feed</a>
          <Link href="/statistics" className={`${styles.navLink} ${styles.navLinkActive}`}>
            Statistics
          </Link>
        </div>
      </nav>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main className={styles.main}>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderTop}>
            <div className={styles.pageHeaderIcon}>📊</div>
            <h1 className={styles.pageHeaderTitle}>Platform Statistics</h1>
          </div>
          <p className={styles.pageHeaderSub}>
            Live insights across users, posts, engagement, and content.
          </p>
        </div>

        {/* Placeholder — more sections coming in next commits */}
        <p style={{ color: "#6b6860", fontSize: 15 }}>
          Stats loading soon…
        </p>

      </main>
    </div>
  );
}
