import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import styles from './Layout.module.css';

import homeIcon from '../../assets/Drop App - Light/home.png';
import cartIcon from '../../assets/Drop App - Light/shopping-cart.png';
import logo from '../../assets/Drop App - Light/New Logo & Brand.png';
import profileIcon from '../../assets/Drop App - Light/Profile.png';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@saev.com';

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.logo}>
            <img src={logo} alt="Saev Logo" />
          </div>
          <nav className={styles.nav}>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
            >
              <img src={homeIcon} alt="Dashboard" />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive || location.pathname.startsWith('/products') ? styles.active : ''}`
              }
            >
              <img src={cartIcon} alt="Products" />
              <span>Products</span>
            </NavLink>
          </nav>
        </div>
        <div className={styles.sidebarBottom}>
          <div className={styles.profile}>
            <img src={profileIcon} alt="Profile" />
            <div className={styles.profileInfo}>
              <p className={styles.profileName}>Admin</p>
              <p className={styles.profileEmail}>{adminEmail}</p>
            </div>
          </div>
          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
