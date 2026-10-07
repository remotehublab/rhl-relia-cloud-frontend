import { t } from './i18n';
import React from 'react';
import './DemoBanner.css';

export default function DemoBanner() {
    return <section className="relia-demo-panel" aria-labelledby="relia-demo-title">
        <div className="relia-demo-copy">
            <h2 id="relia-demo-title">{t('demo.title', "Guided RELIA demonstration")}</h2>
            <p>{t('demo.description', "Try a prepared experiment on real Pluto radios at the University of Washington.")}</p>
        </div>
        <div className="relia-demo-options">
            <div><h3>{t('demo.available', "Available in this demo")}</h3><p>{t('demo.available-description', "Choose a tone, view its spectrum, and watch the live camera.")}</p></div>
            <div><h3>{t('demo.full-access', "With full lab access")}</h3><p>{t('demo.full-access-description', "Upload your own GNU Radio flowgraphs and adjust their parameters.")}</p></div>
        </div>
    </section>;
}
