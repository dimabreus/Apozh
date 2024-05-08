let mediaRecorder;
let audioChunks = [];
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audio1Buffer;
let audio2Buffer;
const currentStatus = document.getElementById("currentStatus");
const currentPlayer = document.getElementById("currentPlayer")
const startRecord = document.getElementById("startBtn");
const stopRecord = document.getElementById("stopBtn");
const listenBtn = document.getElementById("listen");
const nextBtn = document.getElementById("next");
const guessBlock = document.getElementById("guess");
const guessIsRightBlock = document.getElementById("guess__isRight");

let currentStage = 1;

const setActiveStatus = status => {
    currentStatus.textContent = `Статус: ${status}`;
};


const setActivePlayer = player => {
    currentPlayer.textContent = `Активный участник: ${player}`;
};

const setVisibilityRecordButtons = visibility => {
    startRecord.style.display = visibility ? "block" : "none";
    stopRecord.style.display = visibility ? "block" : "none";
};

const setVisibilityListenButtons = visibility => {
    listenBtn.style.display = visibility ? "block" : "none";
    nextBtn.style.display = visibility ? "block" : "none";
};

const setVisibilityGuessBlock = visibility => {
    guessBlock.style.display = visibility ? "block" : "none";
};

const setVisibilityGuessIsRightBlock = visibility => {
    guessIsRightBlock.style.display = visibility ? "block" : "none";
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

                    audio2Buffer = reversedBuffer;
                    setActivePlayer("Участник 2");
                    setActiveStatus("Прослушивание песни 2");
                }

                listenBtn.disabled = false;
                setVisibilityRecordButtons(false);
                setVisibilityListenButtons(true);

                console.log("Запись остановлена, данные обработаны и проигрываются в обратном порядке.");
            });
        };
    }
});

listenBtn.addEventListener("click", function () {
    const source = audioContext.createBufferSource();
    source.buffer = audio1Buffer;
    source.connect(audioContext.destination);
    source.start();
});

nextBtn.addEventListener("click", function () {
    setVisibilityListenButtons(false);
    if (currentStage === 1) {
        setActiveStatus("Перепивание песни 1");
        setVisibilityRecordButtons(true);
        currentStage = 2;
    } else if (currentStage === 2) {
        setActiveStatus("Угадывание песни");
        setVisibilityGuessBlock(true);
    }
})

document.getElementById("guess__confirm").addEventListener("click", function() {
    setVisibilityGuessIsRightBlock(true);
});