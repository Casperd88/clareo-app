import Layout from '../components/Layout';
import EmailLink from '../components/EmailLink';
import styles from './ContentPage.module.css';

export default function Privacy() {
  return (
    <Layout>
      <div className={styles.content}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p style={{ color: 'var(--secondary)', marginBottom: '48px' }}>Last updated: March 20, 2026</p>

        <p>
          Clareo Technologies LLC ("Clareo", "we", "us", or "our") is committed to protecting your privacy. 
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
          you use our applications and services.
        </p>

        <h2>Information We Collect</h2>
        <p>We may collect information that you provide directly to us, including:</p>
        <ul>
          <li>Contact information (such as email address) when you reach out to us</li>
          <li>Information you provide when using our applications</li>
          <li>Communications and correspondence you send to us</li>
        </ul>

        <p>We may also automatically collect certain information when you use our services, including:</p>
        <ul>
          <li>Device information (device type, operating system version)</li>
          <li>Usage data and analytics to improve our services</li>
          <li>Log data and error reports</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Respond to your inquiries and provide customer support</li>
          <li>Send you technical notices and updates</li>
          <li>Monitor and analyze usage patterns to enhance user experience</li>
          <li>Protect against fraudulent or unauthorized activity</li>
        </ul>

        <h2>Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal information 
          against unauthorized access, alteration, disclosure, or destruction. However, no method of 
          transmission over the Internet or electronic storage is completely secure.
        </p>

        <h2>Data Retention</h2>
        <p>
          We retain your personal information only for as long as necessary to fulfill the purposes for 
          which it was collected, including to satisfy legal, accounting, or reporting requirements.
        </p>

        <h2>Third-Party Services</h2>
        <p>
          Our services may contain links to third-party websites or services. We are not responsible for 
          the privacy practices of these third parties. We encourage you to review the privacy policies 
          of any third-party services you access.
        </p>

        <h2>Children's Privacy</h2>
        <p>
          Our services are not directed to children under 13 years of age. We do not knowingly collect 
          personal information from children under 13. If we become aware that we have collected personal 
          information from a child under 13, we will take steps to delete such information.
        </p>

        <h2>Your Rights</h2>
        <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
        <ul>
          <li>The right to access your personal information</li>
          <li>The right to correct inaccurate information</li>
          <li>The right to request deletion of your information</li>
          <li>The right to data portability</li>
          <li>The right to opt out of certain data processing</li>
        </ul>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by 
          posting the new Privacy Policy on this page and updating the "Last updated" date.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
        </p>
        <p>
          <strong>Clareo Technologies LLC</strong><br />
          Email: <EmailLink user="privacy" />
        </p>
      </div>
    </Layout>
  );
}
