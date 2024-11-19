import styles from "./Wellcome.module.scss";

export const Wellcome: React.FC = () => {
  return (
    <>
      <div className={styles.container}>
        <h1>WELLCOME TO CYBGPT!</h1>
        <p>Your all-purpose plant & pest QA assistant</p>
        <a href="#" className={styles.button}>
          ASK ABOUT SOMETHING
        </a>
      </div>
    </>
  );
};
