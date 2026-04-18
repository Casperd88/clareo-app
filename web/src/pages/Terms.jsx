import Layout from '../components/Layout';
import EmailLink from '../components/EmailLink';
import styles from './ContentPage.module.css';

export default function Terms() {
  return (
    <Layout>
      <div className={styles.content}>
        <h1 className={styles.title}>Terms of Service</h1>
        <p style={{ color: 'var(--secondary)', marginBottom: '48px' }}>Last updated: March 20, 2026</p>

        <p>
          Welcome to Clareo Technologies. These Terms of Service ("Terms") govern your use of our 
          applications, websites, and services (collectively, the "Services") provided by Clareo 
          Technologies LLC ("Clareo", "we", "us", or "our").
        </p>

        <p>
          By accessing or using our Services, you agree to be bound by these Terms. If you do not 
          agree to these Terms, please do not use our Services.
        </p>

        <h2>1. Use of Services</h2>
        <p>
          You may use our Services only in compliance with these Terms and all applicable laws and 
          regulations. You agree not to:
        </p>
        <ul>
          <li>Use the Services for any unlawful purpose or in violation of any applicable laws</li>
          <li>Attempt to gain unauthorized access to any portion of the Services</li>
          <li>Interfere with or disrupt the Services or servers connected to the Services</li>
          <li>Reverse engineer, decompile, or disassemble any aspect of the Services</li>
          <li>Use the Services to transmit harmful code or malicious software</li>
          <li>Reproduce, duplicate, copy, sell, or exploit any portion of the Services without permission</li>
        </ul>

        <h2>2. Accounts</h2>
        <p>
          Some features of our Services may require you to create an account. You are responsible for 
          maintaining the confidentiality of your account credentials and for all activities that occur 
          under your account. You agree to notify us immediately of any unauthorized use of your account.
        </p>

        <h2>3. Intellectual Property</h2>
        <p>
          The Services and all content, features, and functionality thereof are owned by Clareo Technologies 
          and are protected by copyright, trademark, and other intellectual property laws. You may not use 
          our trademarks, logos, or other proprietary information without our prior written consent.
        </p>

        <h2>4. User Content</h2>
        <p>
          You retain ownership of any content you submit, post, or display through our Services. By 
          submitting content, you grant us a non-exclusive, worldwide, royalty-free license to use, 
          reproduce, modify, and display such content in connection with providing our Services.
        </p>
        <p>
          You represent and warrant that you have all necessary rights to grant this license and that 
          your content does not violate any third-party rights or applicable laws.
        </p>

        <h2>5. Privacy</h2>
        <p>
          Your use of our Services is also governed by our Privacy Policy, which describes how we 
          collect, use, and protect your personal information.
        </p>

        <h2>6. Disclaimers</h2>
        <p>
          THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER 
          EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, 
          OR SECURE, OR THAT ANY DEFECTS WILL BE CORRECTED.
        </p>

        <h2>7. Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, CLAREO TECHNOLOGIES SHALL NOT BE LIABLE FOR ANY 
          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, 
          DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICES.
        </p>

        <h2>8. Indemnification</h2>
        <p>
          You agree to indemnify, defend, and hold harmless Clareo Technologies and its officers, 
          directors, employees, and agents from any claims, damages, losses, or expenses arising 
          out of your use of the Services or violation of these Terms.
        </p>

        <h2>9. Termination</h2>
        <p>
          We may terminate or suspend your access to the Services at any time, without prior notice 
          or liability, for any reason, including if you breach these Terms. Upon termination, your 
          right to use the Services will immediately cease.
        </p>

        <h2>10. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will notify you of any material 
          changes by posting the updated Terms on our website. Your continued use of the Services 
          after such changes constitutes your acceptance of the new Terms.
        </p>

        <h2>11. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the State of 
          Wyoming, without regard to its conflict of law provisions.
        </p>

        <h2>12. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at:
        </p>
        <p>
          <strong>Clareo Technologies LLC</strong><br />
          Email: <EmailLink user="legal" />
        </p>
      </div>
    </Layout>
  );
}
