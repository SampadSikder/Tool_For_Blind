import { useState, useRef } from 'react';
import axios from './Axios/axios';
import styles from './App.module.scss';
import Classnames from 'classnames';

function App() {
    const [permission, setPermission] = useState(false);
    const [stream, setStream] = useState(null);
    const [recordingStatus, setRecordingStatus] = useState(false);
    const mediaRecorder = useRef(null);
    const [audioChunks, setAudioChunks] = useState([]);
    //const [audio, setAudio] = useState(null);
    const mimeType = 'audio/webm';
    //const [audioBlob, setAudioBlob] = useState(null);
    const [text, setText] = useState([]);
    const [topics, setTopics] = useState([]);

    const getMicrophonePermission = async () => {
        if ('MediaRecorder' in window) {
            try {
                const streamData = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });
                setPermission(true);
                setStream(streamData);
            } catch (err) {
                alert(err.message);
            }
        } else {
            alert('The MediaRecorder API is not supported in your browser.');
        }
    };

    const startRecording = async () => {
        setRecordingStatus(true);
        const media = new MediaRecorder(stream, { type: mimeType });
        mediaRecorder.current = media;
        mediaRecorder.current.start();
        let localAudioChunks = [];
        mediaRecorder.current.ondataavailable = (event) => {
            if (typeof event.data === 'undefined') return;
            if (event.data.size === 0) return;
            localAudioChunks.push(event.data);
        };
        setAudioChunks(localAudioChunks);
    };

    const stopRecording = async () => {
        setRecordingStatus(false);
        mediaRecorder.current.stop();
        mediaRecorder.current.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: mimeType });
            setAudioChunks([]);
            textToSpeech(audioBlob);
        };
    };

    const textToSpeech = async (audioBlob: any) => {
        console.log(audioBlob);
        if (audioBlob !== null) {
            try {
                const response = await axios({
                    method: 'post',
                    url: '/bangla-speech-processing/BanglaASR',
                    data: audioBlob,
                    headers: {
                        'Content-Type': 'audio/mpeg',
                        Authorization: 'Bearer ' + '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',
                    },
                });
                console.log(response);
                setText(current => [...text, response.data.text]);
                getTopicOfText(text);
            } catch (error) {
                if (
                    error.response &&
                    error.response.data.error ===
                    'Model bangla-speech-processing/BanglaASR is currently loading'
                ) {
                    const waitTime = error.response.data.estimated_time * 1000; // convert to milliseconds
                    console.log(`Model is loading. Retrying after ${waitTime / 1000} seconds...`);
                    alert(`Model is loading. Retrying after ${waitTime / 1000} seconds...`);
                    setTimeout(textToSpeech, waitTime);
                } else {
                    console.error(error);
                }
            }
        }
    };


    const getTopicOfText = async (text: any) => {

        if (text !== null) {
            try {
                const response = await axios({
                    method: 'post',
                    url: '/sakib131/bangla-conv-summarizer-model',
                    data: text,
                    headers: {
                        'Content-Type': 'text',
                        Authorization: 'Bearer ' + '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',
                    },
                });
                const newTopics = response.data.map(item => item.generated_text);
                setTopics(newTopics);

            } catch (error) {
                if (
                    error.response &&
                    error.response.data.error ===
                    'Model bangla-speech-processing/BanglaASR is currently loading'
                ) {
                    const waitTime = error.response.data.estimated_time * 1000; // convert to milliseconds
                    console.log(`Model is loading. Retrying after ${waitTime / 1000} seconds...`);
                    alert(`Model is loading. Retrying after ${waitTime / 1000} seconds...`);
                    setTimeout(getTopicOfText, waitTime);
                } else {
                    console.error(error);
                }
            }
        }
    };
    return (
        <div>
            <div className="audio-recorder">
                <h2 className={styles.header}>Start Recording Your Audio Here</h2>
                <main>
                    <div className="audio-controls">
                        {!permission ? (
                            <button onClick={getMicrophonePermission} type="button">
                                Get Microphone
                            </button>
                        ) : recordingStatus ? (
                            <button onClick={stopRecording}>Stop Recording</button>
                        ) : (
                            <button onClick={startRecording}>Start Recording</button>
                        )}
                    </div>
                </main>
                <div className="speech-to-text">
                    <div className="text">
                        <div />
                        <p>{text}</p>
                    </div>
                    <div className="text">
                        {topics.map((topic, index) => (
                            <div key={index}>
                                <p>{topic}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
