class FireworksSimulator {
            constructor() {
                this.canvas = document.getElementById('fireworksCanvas');
                this.ctx = this.canvas.getContext('2d');
                this.particles = [];
                this.rockets = [];
                this.animationId = null;
                this.autoModeInterval = null;
                this.isAutoMode = false;

                // Application data
                this.fireworkTypes = [
                    {name: "Burst", description: "Classic spherical explosion with particles radiating outward"},
                    {name: "Chrysanthemum", description: "Dense spherical burst with trailing particles", trails: true},
                    {name: "Peony", description: "Large spherical break with bright colors"},
                    {name: "Willow", description: "Drooping trails that fall like willow branches", drooping: true},
                    {name: "Palm", description: "Rising trails that curve upward like palm fronds"},
                    {name: "Ring", description: "Circular ring pattern explosion"},
                    {name: "Heart", description: "Heart-shaped particle arrangement"},
                    {name: "Random", description: "Randomly selected type for each firework"}
                ];

                this.colorChemistry = {
                    "Red": {chemical: "Strontium", rgb: [255, 50, 50], hex: "#ff3232"},
                    "Green": {chemical: "Barium", rgb: [50, 255, 50], hex: "#32ff32"},
                    "Blue": {chemical: "Copper", rgb: [50, 150, 255], hex: "#3296ff"},
                    "Gold": {chemical: "Iron", rgb: [255, 215, 0], hex: "#ffd700"},
                    "Silver": {chemical: "Magnesium", rgb: [220, 220, 255], hex: "#dcdcff"},
                    "Purple": {chemical: "Strontium + Copper", rgb: [150, 50, 255], hex: "#9632ff"},
                    "White": {chemical: "Magnesium", rgb: [255, 255, 255], hex: "#ffffff"},
                    "Orange": {chemical: "Calcium", rgb: [255, 165, 0], hex: "#ffa500"}
                };

                this.presets = {
                    "Spectacular": {
                        particleCount: 150, explosionRadius: 250, gravity: 0.3, launchVelocity: 20,
                        brightness: 1.0, trailLength: 30, autoMode: true, launchFrequency: 1.5
                    },
                    "Gentle": {
                        particleCount: 80, explosionRadius: 150, gravity: 0.2, launchVelocity: 15,
                        brightness: 0.7, trailLength: 20, autoMode: true, launchFrequency: 3.0
                    },
                    "Rapid Fire": {
                        particleCount: 100, explosionRadius: 180, gravity: 0.4, launchVelocity: 18,
                        brightness: 0.9, trailLength: 25, autoMode: true, launchFrequency: 0.8
                    },
                    "Giant Bursts": {
                        particleCount: 200, explosionRadius: 300, gravity: 0.25, launchVelocity: 25,
                        brightness: 1.0, trailLength: 40, autoMode: false, launchFrequency: 4.0
                    }
                };

                this.settings = {
                    fireworkType: "Random",
                    color: "Random", 
                    particleCount: 100,
                    explosionRadius: 200,
                    gravity: 0.3,
                    launchVelocity: 18,
                    particleLifetime: 1.5,
                    brightness: 0.8,
                    trailLength: 25,
                    fadeSpeed: 0.02,
                    sparkleEffect: true,
                    autoMode: false,
                    launchFrequency: 2.0,
                    randomPosition: true,
                    multiColor: false,
                    rocketsPerLaunch: 1, // New setting for number of rockets per auto-launch
                    backgroundMusicEnabled: true, // Setting for background music
                    backgroundMusicVolume: 20, // Default volume for background music (0 to 100)
                    youtubeLink: "", // For YouTube audio link
                };

                this.init();
            }

            init() {
                this.setupCanvas();
                // this.loadSounds(); // Local sounds are removed
                this.loadYouTubeAPI(); // Load YouTube API
                this.setupEventListeners();
                this.setupSettingsPanel(); // This calls initializeSettingsValues

                // After settings are initialized from DOM/defaults, attempt to play music if enabled
                if (this.settings.backgroundMusicEnabled) {
                    // If youtubeLink is set, _onYouTubePlayerReady will handle its playback.
                    // Otherwise, play local audio if available.
                    // Local background audio removed, so this check is simplified or handled by playActiveAudio
                    if (!this.settings.youtubeLink) { // If no YouTube link, playActiveAudio will check if YT player is ready for anything else (it won't be)
                         this.playActiveAudio();
                    }
                }
                this.startAnimation();
            }

            setupCanvas() {
                this.resizeCanvas();
                window.addEventListener('resize', () => this.resizeCanvas());
            }

            loadYouTubeAPI() {
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }

            // loadSounds() method can be removed as local file audio is no longer used.

            // Called by global onYouTubeIframeAPIReady
            _onYouTubeAPIReady() {
                this.youtubePlayer = new YT.Player('youtubePlayerElement', {
                    height: '0', // Hidden
                    width: '0',  // Hidden
                    videoId: '', 
                    playerVars: {
                        'autoplay': 0,
                        'controls': 0,
                        'showinfo': 0,
                        'rel': 0,
                        'modestbranding': 1,
                        'iv_load_policy': 3 // Hide annotations
                    },
                    events: {
                        'onReady': (event) => this._onYouTubePlayerReady(event),
                        'onStateChange': (event) => this._onYouTubePlayerStateChange(event),
                        'onError': (event) => this._onYouTubePlayerError(event)
                    }
                });
            }

            _onYouTubePlayerReady(event) {
                console.log("YouTube Player Ready");
                this.youtubePlayerReady = true;
                this.updateActiveAudioVolume(); // Apply initial volume

                if (this.settings.youtubeLink) {
                    this.processYouTubeLink(this.settings.youtubeLink, this.settings.backgroundMusicEnabled);
                } else if (this.settings.backgroundMusicEnabled) { 
                    // If no YouTube link but music is enabled, playActiveAudio will check player state
                    this.playActiveAudio();
                }
            }

            _onYouTubePlayerStateChange(event) {
                if (event.data === YT.PlayerState.ENDED && this.currentYouTubeVideoId) {
                    // Optional: Replay, play next, or do nothing.
                } else if (event.data === YT.PlayerState.CUED && this.settings.backgroundMusicEnabled && this.currentYouTubeVideoId) {
                    this.youtubePlayer.playVideo();
                }
            }
            _onYouTubePlayerError(event) {
                console.error("YouTube Player Error:", event.data, "Link:", this.settings.youtubeLink);
                this.clearYouTubeAudio(false); // Don't clear the link from settings, user might want to retry or fix it
            }

            resizeCanvas() {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
            }

            setupEventListeners() {
                // Canvas click event
                this.canvas.addEventListener('click', (e) => {
                    const rect = this.canvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    this.launchFirework(x, y);
                    this.createLaunchIndicator(x, y);
                });

                // Settings panel toggle
                document.getElementById('togglePanel').addEventListener('click', () => {
                    this.toggleSettingsPanel();
                });

                // Preset buttons
                document.querySelectorAll('.preset-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        this.applyPreset(e.target.dataset.preset);
                    });
                });

                // Reset button
                document.getElementById('resetButton').addEventListener('click', () => {
                    this.resetToDefaults();
                });

                // New Auto Fire Button
                const autoFireButton = document.getElementById('autoFireButton');
                if (autoFireButton) {
                    autoFireButton.addEventListener('click', () => {
                        this.settings.autoMode = !this.settings.autoMode;
                        this.toggleAutoMode();
                    });
                }

                // New Rockets Per Launch Input
                const rocketsPerLaunchInput = document.getElementById('rocketsPerLaunchInput');
                if (rocketsPerLaunchInput) {
                    rocketsPerLaunchInput.addEventListener('input', (e) => {
                        const value = parseInt(e.target.value, 10);
                        this.settings.rocketsPerLaunch = value;
                        this.updateValueDisplay('rocketsPerLaunch', value); // Use setting key
                    });
                }
            }

            setupSettingsPanel() {
                // Auto mode toggle
                const autoModeCheckbox = document.getElementById('autoMode');
                autoModeCheckbox.addEventListener('change', (e) => {
                    this.settings.autoMode = e.target.checked;
                    this.toggleAutoMode();
                });

                // All range inputs
                const rangeInputs = document.querySelectorAll('input[type="range"]');
                rangeInputs.forEach(input => {
                    input.addEventListener('input', (e) => {
                        const value = parseFloat(e.target.value);
                        const settingName = e.target.id;
                        this.settings[settingName] = value;
                        this.updateValueDisplay(settingName, value);
                    });
                });

                // Dropdown selections
                const selects = document.querySelectorAll('select');
                selects.forEach(select => {
                    select.addEventListener('change', (e) => {
                        const settingName = e.target.id === 'primaryColor' ? 'color' : e.target.id;
                        this.settings[settingName] = e.target.value;
                    });
                });

                // Checkboxes
                const checkboxes = document.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    // General handler for most checkboxes
                    if (checkbox.id !== 'autoMode' && checkbox.id !== 'backgroundMusicEnabled') {
                        checkbox.addEventListener('change', (e) => {
                            this.settings[e.target.id] = e.target.checked;
                        });
                    }
                });
                
                // Specific handler for backgroundMusicEnabled checkbox
                const bgMusicCheckbox = document.getElementById('backgroundMusicEnabled');
                if (bgMusicCheckbox) {
                    bgMusicCheckbox.addEventListener('change', (e) => {
                        this.settings.backgroundMusicEnabled = e.target.checked;
                        this.toggleMasterAudio();
                    });
                }

                const bgMusicVolumeSlider = document.getElementById('backgroundMusicVolume');
                if (bgMusicVolumeSlider) {
                    bgMusicVolumeSlider.addEventListener('input', (e) => {
                        // Value from slider is 0-100
                        this.settings.backgroundMusicVolume = parseInt(e.target.value, 10);
                        this.updateActiveAudioVolume();
                        this.updateValueDisplay('backgroundMusicVolume', this.settings.backgroundMusicVolume);
                    });
                }

                // YouTube Link Input
                const youtubeLinkInput = document.getElementById('youtubeLinkInput');
                if (youtubeLinkInput) {
                    youtubeLinkInput.addEventListener('change', (e) => { 
                        this.settings.youtubeLink = e.target.value;
                        // Process only if the master music is enabled or user explicitly loads
                        if (this.settings.backgroundMusicEnabled || !e.target.value) { // Process if clearing or music is on
                           this.processYouTubeLink(this.settings.youtubeLink, this.settings.backgroundMusicEnabled);
                        }
                    });
                }
                 const loadYouTubeAudioButton = document.getElementById('loadYouTubeAudioButton');
                 if (loadYouTubeAudioButton) {
                     loadYouTubeAudioButton.addEventListener('click', () => {
                        const link = document.getElementById('youtubeLinkInput').value;
                        this.settings.youtubeLink = link; 
                        if (link) {
                            if (!this.settings.backgroundMusicEnabled) {
                                this.settings.backgroundMusicEnabled = true;
                                const bgMusicCheckbox = document.getElementById('backgroundMusicEnabled');
                                if (bgMusicCheckbox) bgMusicCheckbox.checked = true;
                            }
                            this.processYouTubeLink(link, true);
                        } else {
                            this.clearYouTubeAudio();
                            if (this.settings.backgroundMusicEnabled) this.playActiveAudio();
                        }
                     });
                 }

                this.initializeSettingsValues();
            }

            initializeSettingsValues() {
                // Set initial values for all controls
                Object.keys(this.settings).forEach(key => {
                    const element = document.getElementById(key) || document.getElementById(key === 'color' ? 'primaryColor' : key);
                    if (element) {
                        if (element.type === 'range') {
                            element.value = this.settings[key];
                            this.updateValueDisplay(key, this.settings[key]);
                        } else if (element.type === 'checkbox') {
                            element.checked = this.settings[key];
                        } else if (element.tagName === 'SELECT') {
                            element.value = this.settings[key];
                        }
                    }
                });

                // Initialize new controls specifically if not covered by the loop above
                // (e.g. if their ID doesn't match a setting key directly)
                const rocketsPerLaunchElement = document.getElementById('rocketsPerLaunchInput');
                if (rocketsPerLaunchElement) {
                    rocketsPerLaunchElement.value = this.settings.rocketsPerLaunch;
                    this.updateValueDisplay('rocketsPerLaunch', this.settings.rocketsPerLaunch);
                }

                // Update autoFireButton text based on initial autoMode state
                const autoFireButton = document.getElementById('autoFireButton');
                if (autoFireButton) {
                    autoFireButton.textContent = this.settings.autoMode ? 'Stop Auto Fire' : 'Start Auto Fire';
                    }
                
                const youtubeLinkElement = document.getElementById('youtubeLinkInput');
                if (youtubeLinkElement) { 
                    youtubeLinkElement.value = this.settings.youtubeLink || "";
                }
            }

            updateValueDisplay(settingName, value) {
                const displayElement = document.getElementById(settingName + 'Value'); // e.g., particleCountValue, rocketsPerLaunchValue
                if (displayElement) {
                    if (settingName === 'particleLifetime' || settingName === 'launchFrequency') {
                        displayElement.textContent = value.toFixed(1);
                    } else if (settingName === 'backgroundMusicVolume') {
                        // Display as percentage
                        displayElement.textContent = value.toString(); // The % is already in HTML
                    } else {
                        displayElement.textContent = value.toString();
                    }
                }
            }

            toggleSettingsPanel() {
                const panel = document.getElementById('settingsPanel');
                const icon = document.getElementById('toggleIcon');
                panel.classList.toggle('collapsed');
                icon.textContent = panel.classList.contains('collapsed') ? '+' : '−';
            }

            toggleAutoMode() {
                // Update UI elements to reflect the current autoMode state
                const autoModeCheckbox = document.getElementById('autoMode');
                if (autoModeCheckbox) {
                    autoModeCheckbox.checked = this.settings.autoMode;
                }
                const autoFireButton = document.getElementById('autoFireButton');
                if (autoFireButton) {
                    autoFireButton.textContent = this.settings.autoMode ? 'Stop Auto Fire' : 'Start Auto Fire';
                }

                if (this.settings.autoMode) {
                    this.startAutoMode();
                } else {
                    this.stopAutoMode();
                }
            }

            startAutoMode() {
                if (this.autoModeInterval) return;
                
                this.isAutoMode = true;
                this.autoModeInterval = setInterval(() => {
                    let x, y;
                    for (let i = 0; i < this.settings.rocketsPerLaunch; i++) {
                        if (this.settings.randomPosition) {
                            x = Math.random() * this.canvas.width;
                            // Launch from bottom third towards middle third for more natural look
                            y = Math.random() * (this.canvas.height * 0.4) + (this.canvas.height * 0.1);
                        } else {
                            x = this.canvas.width / 2;
                            y = this.canvas.height / 2; // Target center
                        }
                        this.launchFirework(x, y);
                    }
                }, this.settings.launchFrequency * 1000);
            }

            stopAutoMode() {
                if (this.autoModeInterval) {
                    clearInterval(this.autoModeInterval);
                    this.autoModeInterval = null;
                }
                this.isAutoMode = false;
            }

            toggleMasterAudio() {
                if (this.settings.backgroundMusicEnabled) {
                    this.playActiveAudio();
                } else {
                    this.pauseActiveAudio();
                }
            }

            playActiveAudio() {
                try {
                    if (this.settings.backgroundMusicEnabled) { // Master switch
                        if (this.currentYouTubeVideoId && this.youtubePlayer && this.youtubePlayerReady) {
                            if (this.youtubePlayer.getPlayerState() !== YT.PlayerState.PLAYING) {
                                this.youtubePlayer.playVideo();
                            }
                            this.updateActiveAudioVolume();
                        } 
                        // No local audio fallback
                    } else {
                        this.pauseActiveAudio(); 
                    }
                } catch (error) {
                    console.warn("Error in playActiveAudio:", error);
                }
            }

            pauseActiveAudio() {
                try {
                    if (this.youtubePlayer && this.youtubePlayerReady && typeof this.youtubePlayer.pauseVideo === 'function') {
                        this.youtubePlayer.pauseVideo();
                    }
                } catch (error) {
                    console.warn("Error in pauseActiveAudio:", error);
                }
            }

            updateActiveAudioVolume() {
                // Ensure this.settings and this.settings.backgroundMusicVolume are valid before this line
                const volumeSetting = this.settings.backgroundMusicVolume; // This is 0-100
                // YouTube API expects volume from 0 to 100.
                if (this.currentYouTubeVideoId && this.youtubePlayer && this.youtubePlayerReady && typeof this.youtubePlayer.setVolume === 'function') {
                    this.youtubePlayer.setVolume(volumeSetting);
                }
            }

            processYouTubeLink(link, playWhenReady = false) {
                if (!this.youtubePlayerReady && link) {
                    this.settings.youtubeLink = link; 
                    console.log("YouTube player not ready, link stored to be processed on ready.");
                    return;
                }
                if (!link) {
                    this.clearYouTubeAudio();
                    // If link is cleared, playActiveAudio will ensure YouTube stops if it was playing.
                    // No local audio to fall back to.
                    if (playWhenReady && this.settings.backgroundMusicEnabled) this.playActiveAudio(); 
                    return;
                }

                const videoId = this._extractYouTubeVideoId(link);
                this.settings.youtubeLink = link; 

                if (videoId) {
                    this.currentYouTubeVideoId = videoId;
                    if (this.youtubePlayer && typeof this.youtubePlayer.loadVideoById === 'function') {
                        this.youtubePlayer.loadVideoById(videoId); // onStateChange or onPlayerReady will handle play
                        this.updateActiveAudioVolume();
                    }
                } else {
                    console.warn("Invalid YouTube link or no video ID found:", link);
                    this.clearYouTubeAudio(false);
                    if (playWhenReady && this.settings.backgroundMusicEnabled) this.playActiveAudio(); 
                }
            }

            _extractYouTubeVideoId(url) {
                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                const match = url.match(regExp);
                return (match && match[2].length === 11) ? match[2] : null;
            }

            clearYouTubeAudio(clearLinkFromSettings = true) {
                if (this.youtubePlayer && this.youtubePlayerReady && typeof this.youtubePlayer.stopVideo === 'function') {
                    this.youtubePlayer.stopVideo();
                }
                this.currentYouTubeVideoId = null;
                if (clearLinkFromSettings) {
                    this.settings.youtubeLink = "";
                    const youtubeLinkInput = document.getElementById('youtubeLinkInput');
                    if (youtubeLinkInput) youtubeLinkInput.value = "";
                }
            }

            applyPreset(presetName) {
                const preset = this.presets[presetName];
                if (!preset) return;

                Object.keys(preset).forEach(key => {
                    this.settings[key] = preset[key];
                    const element = document.getElementById(key) || document.getElementById(key === 'color' ? 'primaryColor' : key); //TODO: refactor this
                    if (element) {
                        if (element.type === 'range') {
                            element.value = preset[key];
                            this.updateValueDisplay(key, preset[key]);
                        } else if (element.type === 'checkbox') {
                            element.checked = preset[key];
                        }
                    }
                });

                this.initializeSettingsValues(); // Refresh all UI to reflect new settings
                this.toggleAutoMode(); // Ensure auto mode logic and UI are synced
                
                // Apply audio settings from preset or defaults
                this.processYouTubeLink(this.settings.youtubeLink, this.settings.backgroundMusicEnabled);
                this.toggleMasterAudio(); 
                this.updateActiveAudioVolume();
            }

            resetToDefaults() {
                const defaults = {
                    fireworkType: "Random", color: "Random", particleCount: 100, explosionRadius: 200,
                    gravity: 0.3, launchVelocity: 18, particleLifetime: 1.5, brightness: 0.8,                    trailLength: 25, fadeSpeed: 0.02, sparkleEffect: true,
                    autoMode: false, launchFrequency: 2.0, randomPosition: true, 
                    multiColor: false, rocketsPerLaunch: 1,
                    backgroundMusicEnabled: true, backgroundMusicVolume: 20, youtubeLink: ""
                };
                this.settings = {...defaults};
                this.initializeSettingsValues();
                this.toggleAutoMode(); // This will call stopAutoMode if autoMode is false
                this.clearYouTubeAudio(); 
                this.toggleMasterAudio();
                this.updateActiveAudioVolume();
            }

            createLaunchIndicator(x, y) {
                const indicator = document.createElement('div');
                indicator.className = 'launch-indicator';
                indicator.style.left = x + 'px';
                indicator.style.top = y + 'px';
                document.body.appendChild(indicator);
                
                setTimeout(() => {
                    document.body.removeChild(indicator);
                }, 300);
            }

            launchFirework(x, y) {
                const rocket = new Rocket(x, this.canvas.height, x, y, this.settings);
                this.rockets.push(rocket);
            }

            getRandomColor() {
                const colors = Object.keys(this.colorChemistry);
                return colors[Math.floor(Math.random() * colors.length)];
            }

            getRandomFireworkType() {
                const types = this.fireworkTypes.filter(t => t.name !== 'Random').map(t => t.name);
                return types[Math.floor(Math.random() * types.length)];
            }

            startAnimation() {
                this.animate();
            }

            animate() {
                // Revert to semi-transparent fillStyle to bring back the trail/blur effect
                this.ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                // Update and draw rockets
                for (let i = this.rockets.length - 1; i >= 0; i--) {
                    const rocket = this.rockets[i];
                    rocket.update();
                    rocket.draw(this.ctx);

                    if (rocket.exploded) {
                        this.createExplosion(rocket.x, rocket.y);
                        this.rockets.splice(i, 1);
                    }
                }

                // Update and draw particles
                for (let i = this.particles.length - 1; i >= 0; i--) {
                    const particle = this.particles[i];
                    particle.update();
                    particle.draw(this.ctx);

                    if (particle.life <= 0) {
                        this.particles.splice(i, 1);
                    }
                }

                this.animationId = requestAnimationFrame(() => this.animate());
            }

            createExplosion(x, y) {
                const type = this.settings.fireworkType === 'Random' ? this.getRandomFireworkType() : this.settings.fireworkType;
                const color = this.settings.color === 'Random' ? this.getRandomColor() : this.settings.color;
                
                switch (type) {
                    case 'Burst':
                        this.createBurstExplosion(x, y, color);
                        break;
                    case 'Ring':
                        this.createRingExplosion(x, y, color);
                        break;
                    case 'Heart':
                        this.createHeartExplosion(x, y, color);
                        break;
                    case 'Willow':
                        this.createWillowExplosion(x, y, color);
                        break;
                    case 'Palm':
                        this.createPalmExplosion(x, y, color);
                        break;
                    case 'Chrysanthemum':
                        this.createChrysanthemumExplosion(x, y, color);
                        break;
                    default:
                        this.createBurstExplosion(x, y, color);
                }
            }

            createBurstExplosion(x, y, colorName) {
                const colorData = this.colorChemistry[colorName];
                const count = this.settings.particleCount;
                
                for (let i = 0; i < count; i++) {
                    const angle = (Math.PI * 2 * i) / count;
                    const velocity = (Math.random() * 5 + 2) * (this.settings.explosionRadius / 200);
                    const vx = Math.cos(angle) * velocity;
                    const vy = Math.sin(angle) * velocity;
                    
                    const particle = new Particle(x, y, vx, vy, colorData.rgb, this.settings);
                    this.particles.push(particle);
                }
            }

            createRingExplosion(x, y, colorName) {
                const colorData = this.colorChemistry[colorName];
                const count = Math.floor(this.settings.particleCount * 0.8);
                
                for (let i = 0; i < count; i++) {
                    const angle = (Math.PI * 2 * i) / count;
                    const velocity = 4 * (this.settings.explosionRadius / 200);
                    const vx = Math.cos(angle) * velocity;
                    const vy = Math.sin(angle) * velocity;
                    
                    const particle = new Particle(x, y, vx, vy, colorData.rgb, this.settings);
                    this.particles.push(particle);
                }
            }

            createHeartExplosion(x, y, colorName) {
                const colorData = this.colorChemistry[colorName];
                const count = this.settings.particleCount;
                
                for (let i = 0; i < count; i++) {
                    const t = (i / count) * Math.PI * 2;
                    const heartX = 16 * Math.pow(Math.sin(t), 3);
                    const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
                    
                    const scale = (this.settings.explosionRadius / 200) * 0.3;
                    const vx = heartX * scale * 0.1;
                    const vy = heartY * scale * 0.1;
                    
                    const particle = new Particle(x, y, vx, vy, colorData.rgb, this.settings);
                    this.particles.push(particle);
                }
            }

            createWillowExplosion(x, y, colorName) {
                const colorData = this.colorChemistry[colorName];
                const count = this.settings.particleCount;
                
                for (let i = 0; i < count; i++) {
                    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5 - 0.25;
                    const velocity = (Math.random() * 3 + 1) * (this.settings.explosionRadius / 200);
                    const vx = Math.cos(angle) * velocity;
                    const vy = Math.sin(angle) * velocity - Math.random() * 2;
                    
                    const particle = new Particle(x, y, vx, vy, colorData.rgb, this.settings);
                    particle.gravity = this.settings.gravity * 1.5; // Extra gravity for willow effect
                    this.particles.push(particle);
                }
            }

            createPalmExplosion(x, y, colorName) {
                const colorData = this.colorChemistry[colorName];
                const count = this.settings.particleCount;
                
                for (let i = 0; i < count; i++) {
                    const angle = (Math.PI * 2 * i) / count;
                    const velocity = (Math.random() * 4 + 2) * (this.settings.explosionRadius / 200);
                    const vx = Math.cos(angle) * velocity;
                    const vy = Math.sin(angle) * velocity - Math.abs(Math.cos(angle)) * 2;
                    
                    const particle = new Particle(x, y, vx, vy, colorData.rgb, this.settings);
                    this.particles.push(particle);
                }
            }

            createChrysanthemumExplosion(x, y, colorName) {
                const colorData = this.colorChemistry[colorName];
                const count = Math.floor(this.settings.particleCount * 1.2);
                
                for (let i = 0; i < count; i++) {
                    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3 - 0.15;
                    const velocity = (Math.random() * 6 + 1) * (this.settings.explosionRadius / 200);
                    const vx = Math.cos(angle) * velocity;
                    const vy = Math.sin(angle) * velocity;
                    
                    const particle = new Particle(x, y, vx, vy, colorData.rgb, this.settings);
                    particle.hasTrail = true;
                    this.particles.push(particle);
                }
            }
        }

        class Rocket {
            constructor(startX, startY, targetX, targetY, settings) {
                this.x = startX;
                this.y = startY;
                this.targetX = targetX;
                this.targetY = targetY;
                this.exploded = false;
                
                const distance = Math.sqrt((targetX - startX) ** 2 + (targetY - startY) ** 2);
                const speed = settings.launchVelocity;
                
                this.vx = ((targetX - startX) / distance) * speed;
                this.vy = ((targetY - startY) / distance) * speed;
                
                this.trail = [];
            }

            update() {
                if (this.exploded) return;

                this.trail.push({x: this.x, y: this.y});
                if (this.trail.length > 20) this.trail.shift();

                this.x += this.vx;
                this.y += this.vy;

                const distance = Math.sqrt((this.targetX - this.x) ** 2 + (this.targetY - this.y) ** 2);
                if (distance < 10 || this.y <= this.targetY) {
                    this.exploded = true;
                }
            }

            draw(ctx) {
                if (this.exploded) return;

                ctx.lineWidth = 2;
                // Draw rocket trail with fading alpha for each segment
                for (let i = 0; i < this.trail.length - 1; i++) {
                    // Alpha fades from nearly 0 at the oldest part to 0.8 at the newest
                    const segmentAlpha = (i / (this.trail.length - 1)) * 0.8; 
                    if (segmentAlpha < 0.01 && i < this.trail.length - 2) continue; // Skip very faint early segments

                    ctx.strokeStyle = `rgba(255, 255, 225, ${segmentAlpha})`; // Slightly yellowish trail
                    ctx.beginPath(); // New path for each segment for its own style
                    ctx.moveTo(this.trail[i].x, this.trail[i].y);
                    ctx.lineTo(this.trail[i + 1].x, this.trail[i + 1].y);
                    ctx.stroke();
                }

                // Draw rocket head
                ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // Ensure full opacity
                ctx.beginPath();
                ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        class Particle {
            constructor(x, y, vx, vy, color, settings) {
                this.x = x;
                this.y = y;
                this.vx = vx;
                this.vy = vy;
                this.color = color;
                this.life = settings.particleLifetime;
                this.maxLife = settings.particleLifetime;
                this.gravity = settings.gravity;
                this.brightness = settings.brightness;
                this.fadeSpeed = settings.fadeSpeed;
                this.sparkle = settings.sparkleEffect;
                this.size = Math.random() * 2.5 + 1; // Slightly smaller max size
                this.hasTrail = false;
                this.trail = [];
            }

            update() {
                if (this.life <= 0) return;

                this.x += this.vx;
                this.y += this.vy;
                this.vy += this.gravity;
                this.life -= this.fadeSpeed;

                this.vx *= 0.99; // Air resistance
                this.vy *= 0.99;

                if (this.hasTrail) {
                    this.trail.push({x: this.x, y: this.y, life: this.life});
                    if (this.trail.length > 10) this.trail.shift();
                }
            }

            draw(ctx) {
                const lifeRatio = Math.max(0, this.life / this.maxLife);
                if (lifeRatio <= 0) return; // Particle is dead

                const baseAlpha = lifeRatio * this.brightness;

                // Current size based on lifeRatio
                let currentRenderSize = this.size * lifeRatio;

                // Particle Trail
                if (this.hasTrail && this.trail.length > 1) {
                    const trailBaseAlpha = baseAlpha * 0.35; // Trails are fainter
                    if (trailBaseAlpha > 0.01) { // Only draw trail if it's somewhat visible
                        ctx.strokeStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${trailBaseAlpha})`;
                        ctx.lineWidth = Math.max(0.5, currentRenderSize * 0.3); // Trail width related to current particle size
                        ctx.beginPath();
                        ctx.moveTo(this.trail[0].x, this.trail[0].y);
                        let lastX = this.trail[0].x;
                        let lastY = this.trail[0].y;
                        for (let i = 1; i < this.trail.length; i++) {
                            // Only add lineTo if the point has moved sufficiently
                            if (Math.abs(this.trail[i].x - lastX) > 0.5 || Math.abs(this.trail[i].y - lastY) > 0.5) {
                                ctx.lineTo(this.trail[i].x, this.trail[i].y);
                                lastX = this.trail[i].x;
                                lastY = this.trail[i].y;
                            }
                        }
                        if (ctx.currentPath && !ctx.currentPath.data.endsWith('M')) { // Check if path has more than just moveTo
                             ctx.stroke();
                        }
                    }
                }

                const sparkleActive = this.sparkle && Math.random() > 0.92; // Sparkle less frequently
                let particleAlpha = baseAlpha;

                if (sparkleActive) {
                    particleAlpha *= 1.4; // Brighter
                    currentRenderSize *= 1.3;  // Larger
                }
                particleAlpha = Math.min(1, particleAlpha); // Cap alpha at 1

                if (currentRenderSize < 0.2) return; // Don't draw very small/faint particles

                // Manual Glow effect (more performant than shadowBlur)
                // Draw glow first, so the main particle is on top
                const glowAlpha = particleAlpha * 0.25 * (sparkleActive ? 1.3 : 1);
                const glowSize = currentRenderSize * (sparkleActive ? 2.0 : 1.5);
                if (this.sparkle && glowAlpha > 0.02 && glowSize > 0.5) { // Conditions for drawing glow
                    ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${glowAlpha})`;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Main particle
                ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${particleAlpha})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, currentRenderSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Initialize the application
        document.addEventListener('DOMContentLoaded', () => {
            // Store instance globally for YouTube API callback
            window.fireworksSimulatorInstance = new FireworksSimulator();
        });

        // Global function for YouTube API callback
        // Needs to be in global scope
        function onYouTubeIframeAPIReady() {
            if (window.fireworksSimulatorInstance && typeof window.fireworksSimulatorInstance._onYouTubeAPIReady === 'function') {
                window.fireworksSimulatorInstance._onYouTubeAPIReady();
            } else {
                console.error("FireworksSimulator instance not ready for YouTube API or _onYouTubeAPIReady not defined.");
            }
        }