import React, { useState } from 'react';
import { Button, Form, Alert, Container } from 'react-bootstrap';

export default function DemoIntroduction({ onRun, pending, error }) {
    const [tone, setTone] = useState('middle');
    const peak = {low:'2450.025', middle:'2450.075', high:'2450.125'}[tone];
    return <Container className="relia-demo-introduction">
        <div className="relia-demo-experiment">
            <span className="relia-demo-eyebrow">Explore radio signals</span>
            <h2>Send a tone. Find it in the spectrum.</h2>
            <p className="relia-demo-lead">Send a signal from one Pluto radio to another, then find it in the received spectrum.</p>
            <Form.Group className="mb-3" controlId="demo-tone">
                <Form.Label>Tone offset from the 2450 MHz carrier</Form.Label>
                <Form.Select value={tone} onChange={event => setTone(event.target.value)} disabled={pending} aria-describedby="demo-peak">
                    <option value="low">25 kHz</option>
                    <option value="middle">75 kHz</option>
                    <option value="high">125 kHz</option>
                </Form.Select>
                <Form.Text id="demo-peak">Look for a peak near {peak} MHz.</Form.Text>
            </Form.Group>
            <Button onClick={() => onRun(tone)} disabled={pending}>{pending ? 'Starting measurement…' : 'Run on real radios'}</Button>
            {error && <Alert variant="danger" className="mt-3" role="alert">{error}</Alert>}
        </div>
        <aside className="relia-demo-guide" aria-label="Measurement guide">
            <h3>What to look for</h3>
            <ol>
                <li><strong>Find your signal</strong><span>Look for the peak near the selected frequency. Small offsets between radios are normal.</span></li>
                <li><strong>See the hardware</strong><span>Open the live camera to see the radio pair running your experiment.</span></li>
                <li><strong>Move the peak</strong><span>Return here and choose another tone. Compare where the peak appears.</span></li>
            </ol>
        </aside>
    </Container>;
}
