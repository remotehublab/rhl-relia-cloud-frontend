import { t } from './i18n';
import React, { useState } from 'react';
import { Button, Form, Alert, Container } from 'react-bootstrap';

export default function DemoIntroduction({ onRun, pending, error }) {
    const [tone, setTone] = useState('middle');
    const peak = {low:'2450.025', middle:'2450.075', high:'2450.125'}[tone];
    return <Container className="relia-demo-introduction">
        <div className="relia-demo-experiment">
            <span className="relia-demo-eyebrow">{t('demo.eyebrow', "Explore radio signals")}</span>
            <h2>{t('demo.heading', "Send a tone. Find it in the spectrum.")}</h2>
            <p className="relia-demo-lead">{t('demo.lead', "Send a signal from one Pluto radio to another, then find it in the received spectrum.")}</p>
            <Form.Group className="mb-3" controlId="demo-tone">
                <Form.Label>{t('demo.tone-label', "Tone offset from the 2450 MHz carrier")}</Form.Label>
                <Form.Select value={tone} onChange={event => setTone(event.target.value)} disabled={pending} aria-describedby="demo-peak">
                    <option value="low">25 kHz</option>
                    <option value="middle">75 kHz</option>
                    <option value="high">125 kHz</option>
                </Form.Select>
                <Form.Text id="demo-peak">{t("demo.peak", {defaultValue: "Look for a peak near {{peak}} MHz.", peak})}</Form.Text>
            </Form.Group>
            <Button onClick={() => onRun(tone)} disabled={pending}>{pending ? t('demo.starting', 'Starting measurement…') : t('demo.run', 'Run on real radios')}</Button>
            {error && <Alert variant="danger" className="mt-3" role="alert">{error}</Alert>}
        </div>
        <aside className="relia-demo-guide" aria-label={t("demo.guide-label", "Measurement guide")}>
            <h3>{t('demo.guide-heading', "What to look for")}</h3>
            <ol>
                <li><strong>{t('demo.find', "Find your signal")}</strong><span>{t('demo.find-description', "Look for the peak near the selected frequency. Small offsets between radios are normal.")}</span></li>
                <li><strong>{t('demo.hardware', "See the hardware")}</strong><span>{t('demo.hardware-description', "Open the live camera to see the radio pair running your experiment.")}</span></li>
                <li><strong>{t('demo.move', "Move the peak")}</strong><span>{t('demo.move-description', "Return here and choose another tone. Compare where the peak appears.")}</span></li>
            </ol>
        </aside>
    </Container>;
}
