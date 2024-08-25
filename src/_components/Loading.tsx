import React from 'react';
import styles from './Loader.module.css';

const Loading: React.FC = () => {
  return (
    <div className={styles.loader}>

      <div className={styles.container}>
        <div className={styles.ball}></div>
        <div className={styles.ball}></div>
        <div className={styles.ball}></div>
        <div className={styles.ball}></div>
        <div className={styles.ball}></div>
      </div>
    </div>
  );
};

export default Loading;
