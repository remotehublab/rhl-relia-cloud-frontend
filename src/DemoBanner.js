import React from 'react';
import './DemoBanner.css';

export default function DemoBanner() {
    return <section className="relia-demo-panel" aria-labelledby="relia-demo-title">
        <div className="relia-demo-copy">
            <h2 id="relia-demo-title">Guided RELIA demonstration</h2>
            <p>Try a prepared experiment on real Pluto radios at the University of Washington.</p>
        </div>
        <div className="relia-demo-options">
            <div><h3>Available in this demo</h3><p>Choose a tone, view its spectrum, and watch the live camera.</p></div>
            <div><h3>With full lab access</h3><p>Upload your own GNU Radio flowgraphs and adjust their parameters.</p></div>
        </div>
    </section>;
}
