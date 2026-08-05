import { Fragment } from 'react';
import { tickerStats } from '../data/projects';
import './Ticker.css';

function Row({ hidden }) {
  return (
    <ul className="ticker__row" aria-hidden={hidden}>
      {tickerStats.map((s) => (
        <Fragment key={s.pre}>
          <li>
            {s.pre} <b>{s.bold}</b>{s.post ? ` ${s.post}` : ''}
          </li>
          <li aria-hidden="true">✦</li>
        </Fragment>
      ))}
    </ul>
  );
}

export default function Ticker() {
  return (
    <section className="ticker" aria-label="Key figures">
      <div className="ticker__track">
        <Row hidden={false} />
        <Row hidden={true} />
      </div>
    </section>
  );
}
