import Layout from "../components/Layout";
import EmailLink from "../components/EmailLink";
import styles from "./ContentPage.module.css";

export default function Contact() {
  return (
    <Layout>
      <div className={styles.content}>
        <h1 className={styles.title}>Contact us</h1>

        <p>Questions, comments, or partnerships? Reach out.</p>

        <div className={styles.contactBlock}>
          <h2>General inquiries</h2>
          <p>
            <EmailLink />
          </p>
        </div>

        <div className={styles.contactBlock}>
          <h2>Business & partnerships</h2>
          <p>
            <EmailLink />
          </p>
        </div>

        <div className={styles.contactBlock}>
          <h2>Company</h2>
          <p>Clareo Technologies LLC</p>
          <p>Wyoming, USA</p>
        </div>
      </div>
    </Layout>
  );
}
