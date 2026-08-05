export const projects = [
  {
    year: '2026',
    pill: 'Winner — Technex ’26, IIT BHU',
    title: 'Stellar Analytics',
    desc: 'Benchmarked 16 ML models on 9,564 NASA Kepler records for exoplanet classification and radius prediction — best classifier landed a 0.9504 ROC-AUC. Wrapped in a FastAPI inference pipeline with live diagnostics and feature-importance views.',
    tags: ['Scikit-learn', 'LightGBM', 'FastAPI', 'React'],
    links: [
      { label: 'View demo', href: 'https://planetsearch.netlify.app/' },
      { label: 'Source', href: 'https://github.com/sohamroy06/Planet-Search-Algorithm' },
    ],
  },
  {
    year: '2026',
    pill: null,
    title: 'AlgoZen',
    desc: 'A regime-aware, systematic trading strategy over NIFTY 500 — walk-forward backtested to a 10.92% CAGR and 1.129 Sharpe. Custom Python backtesting engine with ATR trailing stops, volatility targeting, and circuit breakers.',
    tags: ['Python', 'Pandas', 'NumPy'],
    links: [
      { label: 'Source', href: 'https://github.com/sohamroy06/ALGOZEN_NEW' },
    ],
  },
  {
    year: '2025',
    pill: null,
    title: 'ShadowMap',
    desc: 'Geospatial ML predicting urban surface temperature from Sentinel-3, Landsat NDVI, and OSM features across Delhi — R² of 0.926. Quantile regression and intervention simulation, surfaced through an interactive Leaflet.js choropleth.',
    tags: ['XGBoost', 'FastAPI', 'React', 'Leaflet.js'],
    links: [
      { label: 'View demo', href: 'https://urban-heat-island-prediction.netlify.app/' },
      { label: 'Source', href: 'https://github.com/sohamroy06/Urban-Heat-Island-Prediction' },
    ],
  },
  {
    year: '2025',
    pill: null,
    title: 'Carbon-Wise',
    desc: 'A vehicle lifecycle emissions platform comparing EV against ICE carbon output across manufacturing, operation, and disposal — built to make an abstract number feel like a real decision.',
    tags: ['React', 'Node.js', 'Express.js', 'SQLite'],
    links: [
      { label: 'Source', href: 'https://github.com/sohamroy06/carbon-wise' },
    ],
  },
];

export const tickerStats = [
  { pre: 'CGPA', bold: '9.14/10', post: '' },
  { pre: 'ROC-AUC', bold: '0.9504', post: '— exoplanet classifier' },
  { pre: 'SHARPE', bold: '1.129', post: '— AlgoZen' },
  { pre: 'R²', bold: '0.926', post: '— ShadowMap' },
  { pre: '10,000+', bold: 'registrations', post: '— ACEHack 5.0' },
  { pre: '5×', bold: 'hackathon finalist', post: '' },
];
