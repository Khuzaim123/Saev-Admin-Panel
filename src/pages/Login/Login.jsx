import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styles from './Login.module.css';

import logo from '../../assets/Drop App - Light/New Logo & Brand.png';
import emailIcon from '../../assets/Drop App - Light/Email.png';
import unlockIcon from '../../assets/Drop App - Light/unlock.png';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');

      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@saev.com';
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

      if (data.email !== adminEmail || data.password !== adminPassword) {
        throw new Error('Invalid email or password');
      }

      // Import Firebase auth dynamically
      const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');
      const { auth } = await import('../../firebase');

      await signInWithEmailAndPassword(auth, data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.logoContainer}>
          <img src={logo} alt="Saev Logo" />
        </div>

        <h1 className={styles.loginTitle}>Admin Login</h1>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label className="form-label">Email</label>
            <div className={styles.inputWrapper}>
              <img src={emailIcon} alt="Email" className={styles.inputIcon} />
              <input
                type="email"
                className={`input-field ${errors.email ? 'error' : ''}`}
                placeholder="admin@saev.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
            </div>
            {errors.email && <p className="text-error">{errors.email.message}</p>}
          </div>

          <div className={styles.formGroup}>
            <label className="form-label">Password</label>
            <div className={styles.inputWrapper}>
              <img src={unlockIcon} alt="Password" className={styles.inputIcon} />
              <input
                type="password"
                className={`input-field ${errors.password ? 'error' : ''}`}
                placeholder="Enter password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
            </div>
            {errors.password && <p className="text-error">{errors.password.message}</p>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <div className="spinner"></div>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>

          {error && <p className={`text-error ${styles.errorMessage}`}>{error}</p>}
        </form>
      </div>
    </div>
  );
}
