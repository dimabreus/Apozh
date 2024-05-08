let mediaRecorder;
let audioChunks = [];
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audio1Buffer;
let audio2Buffer;
const currentStatus = document.getElementById("currentStatus");
const currentPlayer = document.getElementById("currentPlayer")
const startRecord = document.getElementById("startBtn");


let currentStage = 1;

const setActiveStatus = status => {
    currentStatus.textContent = `Статус: ${status}`;
};


const setActivePlayer = player => {
    currentPlayer.textContent = `Активный участник: ${player}`;
};


document.getElementById("startBtn").addEventListener("click", function () {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();

            mediaRecorder.ondataavailable = function (event) {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstart = () => {
                console.log("Запись начата!");
            };

            mediaRecorder.onerror = (event) => {
                console.error("Ошибка записи: ", event.error);
            };
        })
        .catch(error => {
            console.error("Ошибка доступа к микрофону: ", error);
        });
});

document.getElementById("stopBtn").addEventListener("click", function () {
    if (mediaRecorder) {
        mediaRecorder.stop();

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            audioChunks = [];

            let arrayBuffer = await audioBlob.arrayBuffer();
            audioContext.decodeAudioData(arrayBuffer, (buffer) => {
                let reversedBuffer = audioContext.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);

                // Reverse the playback
                for (let i = 0; i < buffer.numberOfChannels; i++) {
                    buffer.copyFromChannel(reversedBuffer.getChannelData(i), i);
                    reversedBuffer.getChannelData(i).reverse();
                }

                if (currentStage === 1) {
                    audio1Buffer = reversedBuffer;
                    setActivePlayer("Участник 2");
                    setActiveStatus("Прослушивание песни 1");    
                } else if (currentStage === 2) {
                    audio2Buffer = reversedBuffer;
                    setActivePlayer("Участник 2");
                    setActiveStatus("Прослушивание песни 2");    
                }

                document.getElementById("listen").disabled = false;

                console.log("Запись остановлена, данные обработаны и проигрываются в обратном порядке.");
            });
        };
    }
});

document.getElementById("listen").addEventListener("click", function (e) {
    const source = audioContext.createBufferSource();
    source.buffer = audio1Buffer;
    source.connect(audioContext.destination);
    source.start();
});