import styles from './StatCard.module.css';

export default function StatCard({ title, value, icon, color = 'primary' }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <p className={styles.cardTitle}>{title}</p>
        <p className={`${styles.cardValue} ${styles[color]}`}>{value}</p>
      </div>
      {icon && <div className={styles.cardIcon}>{icon}</div>}
    </div>
  );
}
