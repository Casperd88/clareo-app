import Layout from "../components/Layout";
import EmailLink from "../components/EmailLink";
import styles from "./ContentPage.module.css";

export default function About() {
  return (
    <Layout>
      <div className={styles.content}>
        <h1 className={styles.title}>About Clareo</h1>

        <p className={styles.intro}>
          Clareo is built around a simple premise: ideas should be clear.
        </p>

        <p>
          We're surrounded by more knowledge than ever, yet understanding feels
          increasingly shallow. Books are compressed into summaries, insights
          are reduced to quotes, and complex thinking is flattened into
          something easy to consume but difficult to trust.
        </p>

        <p>Clareo takes a different approach.</p>

        <h2>What we do</h2>
        <p>We don't summarize books. We reinterpret them.</p>
        <p>
          Each title is carefully broken down into its core ideas, then rebuilt
          into a clear, structured narrative designed for listening. Along the
          way, we refine what holds up, question what doesn't, and place each
          idea in a modern context.
        </p>
        <p>The result is not a shorter version of a book, but a sharper one.</p>

        <h2>Why it exists</h2>
        <p>
          Reading a book doesn't guarantee understanding. And consuming more
          content doesn't necessarily lead to better thinking.
        </p>
        <p>
          Clareo is built for people who are intentional with their attention.
          People who don't just want exposure to ideas, but clarity on what
          actually matters.
        </p>
        <p>
          Not everything deserves to be preserved as-is. Some ideas need to be
          challenged. Others need to be reframed. Many need to be stripped down
          to their essence before they become useful.
        </p>
        <p>That is the work.</p>

        <h2>Why audio</h2>
        <p>
          Interpretation is best experienced as a guided flow, not fragmented
          text.
        </p>
        <p>
          Audio allows ideas to unfold at the right pace. It creates space for
          emphasis, for structure, for coherence. Instead of scanning, you
          follow. Instead of collecting fragments, you build understanding.
        </p>
        <p>Clareo is designed to move with you, without losing depth.</p>

        <h2>Our perspective</h2>
        <p>We don't aim to be neutral.</p>
        <p>
          Every piece of content is an interpretation, shaped by judgment and
          intent. Rather than hide that, we make it explicit. Where ideas are
          strong, we sharpen them. Where they fall short, we say so.
        </p>
        <p>
          Clareo is not a replacement for original work. It's a layer that helps
          you see it more clearly.
        </p>

        <h2>What it leads to</h2>
        <p>
          Over time, the goal is simple: to move from consuming ideas to
          understanding them.
        </p>

        <h2>Contact</h2>
        <p>
          <EmailLink />
        </p>
      </div>
    </Layout>
  );
}
