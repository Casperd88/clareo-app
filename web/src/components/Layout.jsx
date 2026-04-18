import Footer from './Footer';
import PageTransition from './PageTransition';
import styles from './Layout.module.css';

export default function Layout({ children }) {
  return (
    <div className={styles.wrapper}>
      <PageTransition>
        <main className={styles.main}>{children}</main>
        <Footer />
      </PageTransition>
    </div>
  );
}
