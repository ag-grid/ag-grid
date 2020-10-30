import React from 'react';
import { Link } from 'gatsby';

export default function Home() {
  return <div style={{ textAlign: 'center' }}>
    <h1>404: Awesomeness Not Found</h1>

    <div>Try <Link to="/">going home?</Link></div>
  </div>;
}
