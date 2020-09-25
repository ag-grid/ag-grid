import React from "react";
import Layout from '../components/layout';
import './index.css';

export default function Home() {
  return <Layout>
    <div style={{ textAlign: 'center' }}>
      <h1>404: Awesomeness Not Found</h1>

      <div>Try <a href="/">going home?</a></div>
    </div>
  </Layout>;
}
