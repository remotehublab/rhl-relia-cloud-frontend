import React, { useState } from 'react';
import { Button, Form, Alert, Container } from 'react-bootstrap';

export default function DemoIntroduction({ onRun, pending, error }) {
    const [tone, setTone] = useState('middle');
    const peak = {low:'2450.025', middle:'2450.075', high:'2450.125'}[tone];
    return <Container className="px-3 py-4">
        <div className="mx-auto" style={{ maxWidth: 720 }}>
            <h2>Send a tone. Find it in the spectrum.</h2>
            <p>One ADALM Pluto transmits a radio signal and another receives it at the University of Washington. Run a short measurement and look for the peak in the received spectrum.</p>
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
            <ol className="mt-4">
                <li>Find the peak in the received spectrum. Small frequency differences are normal for two separate radios.</li>
                <li>Open the camera to see the radio pair used for your measurement.</li>
                <li>Return here, choose another tone, and compare where the peak appears.</li>
            </ol>
            <p>This demo uses preloaded flowgraphs. A full lab session lets you upload your own GNU Radio transmitter and receiver.</p>
        </div>
    </Container>;
}
