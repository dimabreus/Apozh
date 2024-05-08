let mediaRecorder;
let audioChunks = [];
let audioContext = new (window.AudioContext || window.webkitAudioContext)();

document.getElementById("startBtn").addEventListener("click", function() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();

            mediaRecorder.ondataavailable = function(event) {
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

document.getElementById("stopBtn").addEventListener("click", function() {
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

                const source = audioContext.createBufferSource();
                source.buffer = reversedBuffer;
                source.connect(audioContext.destination);
                source.start();

                console.log("Запись остановлена, данные обработаны и проигрываются в обратном порядке.");
            });

            document.getElementById("playReverseBtn").style.display = 'block';
        };
    }
});