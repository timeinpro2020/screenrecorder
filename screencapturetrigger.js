		window.onload = () => {
		  const startBtn = document.getElementById('startBtn');
		  const stopBtn = document.getElementById('stopBtn');
		  const download = document.getElementById('download');
		  const audioToggle = document.getElementById('audioToggle');
		  const micAudioToggle = document.getElementById('micAudioToggle');

		  let blobs;
		  let blob;
		  let rec;
		  let stream;
		  let voiceStream;
		  let desktopStream;
		  
		  const mergeAudioStreams = (desktopStream, voiceStream) => {
			const context = new AudioContext();
			const destination = context.createMediaStreamDestination();
			let hasDesktop = false;
			let hasVoice = false;
			if (desktopStream && desktopStream.getAudioTracks().length > 0) {
			  const source1 = context.createMediaStreamSource(desktopStream);
			  const desktopGain = context.createGain();
			  desktopGain.gain.value = 0.7;
			  source1.connect(desktopGain).connect(destination);
			  hasDesktop = true;
			}
			
			if (voiceStream && voiceStream.getAudioTracks().length > 0) {
			  const source2 = context.createMediaStreamSource(voiceStream);
			  const voiceGain = context.createGain();
			  voiceGain.gain.value = 0.7;
			  source2.connect(voiceGain).connect(destination);
			  hasVoice = true;
			}
			  
			return (hasDesktop || hasVoice) ? destination.stream.getAudioTracks() : [];
		  };

		  startBtn.onclick = async () => {
			download.style.display = 'none';
			const audio = audioToggle.checked || false;
			const mic = micAudioToggle.checked || false;
			
			desktopStream = await navigator.mediaDevices.getDisplayMedia({ video:true, audio: audio });
			
			if (mic === true) {
			  voiceStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: mic });
			}
		  
			const tracks = [
			  ...desktopStream.getVideoTracks(), 
			  ...mergeAudioStreams(desktopStream, voiceStream)
			];
			
			stream = new MediaStream(tracks);
			  
			blobs = [];
		  
			rec = new MediaRecorder(stream, {mimeType: 'video/webm; codecs=vp8,opus'});
			rec.ondataavailable = (e) => blobs.push(e.data);
			rec.onstop = async () => {
			  //blobs.push(MediaRecorder.requestData());
			  blob = new Blob(blobs, {type: 'video/webm'});
			  let url = window.URL.createObjectURL(blob);
			  download.href = url;
			  download.download = 'test.webm';
			  download.style.display = 'block';
			};
			audioToggle.disabled = true;
			micAudioToggle.disabled = true;
			startBtn.disabled = true;
			stopBtn.disabled = false;
			rec.start();
		  };
		  
		  stopBtn.onclick = () => {
			startBtn.disabled = false;
			stopBtn.disabled = true;
			audioToggle.disabled = false;
			micAudioToggle.disabled = false;
			
			rec.stop();
			stream.getTracks().forEach(s=>s.stop())
			stream = null;
		  };
		};