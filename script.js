
        let players = [];
        let playerId = 0;
        let achievements = [];

        // Initialize
        document.getElementById('gameDate').valueAsDate = new Date();

        function addPlayer() {
            const name = prompt("Enter player name:");
            if (!name) return;
            
            const handicap = prompt("Enter player handicap (0-54):");
            if (handicap === null) return;
            
            const player = {
                id: ++playerId,
                name: name.trim(),
                handicap: Math.max(0, Math.min(54, parseInt(handicap) || 0)),
                scores: new Array(18).fill(''),
                grossTotal: 0,
                netTotal: 0,
                matchStatus: new Array(18).fill(''),
                matchScore: 0,
                achievements: []
            };
            
            players.push(player);
            renderPlayers();
            updateRankings();
            updateAchievements();
        }

        function removePlayer(id) {
            if (confirm('Remove this player from the scorecard?')) {
                players = players.filter(p => p.id !== id);
                renderPlayers();
                updateRankings();
                updateAchievements();
            }
        }

        function renderPlayers() {
            const container = document.getElementById('playersScorecard');
            
            // Update course display
            const courseName = document.getElementById('courseName').value;
            const gameDate = document.getElementById('gameDate').value;
            document.getElementById('courseDisplay').textContent = `Course: ${courseName || 'Not Set'}`;
            document.getElementById('dateDisplay').textContent = `Date: ${gameDate || 'Not Set'}`;

            if (players.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-12 text-gray-500">
                        <i class="fas fa-users text-6xl mb-4 text-gray-300"></i>
                        <p class="text-xl font-medium">No players added yet</p>
                        <p class="text-gray-400">Click "Add Player" to get started</p>
                    </div>`;
                return;
            }

            container.innerHTML = '';
            players.forEach((player, index) => {
                const playerDiv = document.createElement('div');
                playerDiv.className = 'bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-200';
                
                playerDiv.innerHTML = `
                    <div class="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <div class="flex flex-wrap items-center gap-2 md:gap-4 mb-2 md:mb-0">
                            <h4 class="text-lg md:text-xl font-bold text-gray-800 flex items-center">
                                <div class="w-8 h-8 bg-gradient-to-r from-grit-green to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                    ${index + 1}
                                </div>
                                ${player.name}
                            </h4>
                            <span class="bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 px-3 py-1 rounded-full text-sm font-bold">HCP: ${player.handicap}</span>
                            <span class="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">Gross: <span id="gross-${player.id}">0</span></span>
                            <span class="bg-gradient-to-r from-green-100 to-green-200 text-green-700 px-3 py-1 rounded-full text-sm font-bold">Net: <span id="net-${player.id}">0</span></span>
                            <span class="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 px-3 py-1 rounded-full text-sm font-bold" id="match-total-${player.id}">Match: AS</span>
                        </div>
                        <button onclick="removePlayer(${player.id})" class="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-all duration-200">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                    
                    <!-- Mobile-friendly scorecard grid -->
                    <div class="mobile-scroll">
                        <!-- Gross Score Row -->
                        <div class="scorecard-grid mb-2 min-w-max">
                            <div class="hole-cell bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold text-xs rounded-l">Gross</div>
                            ${Array.from({length: 18}, (_, i) => `
                                <input type="number" 
                                       class="score-input border hover:bg-gray-50 transition-colors" 
                                       id="gross-${player.id}-${i+1}"
                                       min="1" max="15"
                                       onchange="updatePlayerScore(${player.id}, ${i}, this.value, 'gross')"
                                       placeholder="-">
                            `).join('')}
                            <div class="hole-cell bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold rounded-r" id="grossTotal-${player.id}">0</div>
                        </div>
                        
                        <!-- Net Score Row -->
                        <div class="scorecard-grid mb-2 min-w-max">
                            <div class="hole-cell bg-gradient-to-r from-grit-green to-green-600 text-white font-bold text-xs rounded-l">Net</div>
                            ${Array.from({length: 18}, (_, i) => `
                                <div class="hole-cell bg-green-50 border font-semibold text-green-700 hover:bg-green-100 transition-colors" id="net-${player.id}-${i+1}">-</div>
                            `).join('')}
                            <div class="hole-cell bg-gradient-to-r from-grit-green to-green-600 text-white font-bold rounded-r" id="netTotal-${player.id}">0</div>
                        </div>
                        
                        <!-- Match Play Row -->
                        <div class="scorecard-grid min-w-max">
                            <div class="hole-cell bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold text-xs rounded-l">Match</div>
                            ${Array.from({length: 18}, (_, i) => `
                                <div class="hole-cell bg-purple-50 border text-xs font-bold hover:bg-purple-100 transition-colors" id="match-${player.id}-${i+1}">AS</div>
                            `).join('')}
                            <div class="hole-cell bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-r" id="matchTotal-${player.id}">AS</div>
                        </div>
                    </div>
                `;
                
                container.appendChild(playerDiv);
            });

            // Show/hide match play section
            const gameType = document.getElementById('gameType').value;
            const matchSection = document.getElementById('matchPlaySection');
            matchSection.style.display = (gameType === 'match' || gameType === 'both') ? 'block' : 'none';
        }

        function updatePlayerScore(playerId, holeIndex, score, type) {
            const player = players.find(p => p.id === playerId);
            if (!player) return;

            const grossScore = parseInt(score) || '';
            player.scores[holeIndex] = grossScore;

            // Calculate net score
            const holeHandicaps = Array.from(document.querySelectorAll('.scorecard-grid:nth-child(3) input')).map(input => parseInt(input.value) || 18);
            const playerHandicap = player.handicap;
            const holeHandicap = holeHandicaps[holeIndex];
            
            let strokesReceived = 0;
            if (playerHandicap >= holeHandicap) {
                strokesReceived = Math.floor(playerHandicap / 18) + (playerHandicap % 18 >= holeHandicap ? 1 : 0);
            }

            const netScore = grossScore ? grossScore - strokesReceived : '';
            
            // Update net score display
            const netCell = document.getElementById(`net-${playerId}-${holeIndex + 1}`);
            if (netCell) {
                netCell.textContent = netScore || '-';
                
                // Enhanced color coding based on par
                const par = getPar(holeIndex);
                if (netScore) {
                    netCell.className = 'hole-cell border font-semibold transition-colors ' + getScoreClass(netScore, par);
                } else {
                    netCell.className = 'hole-cell bg-green-50 border font-semibold text-green-700 hover:bg-green-100 transition-colors';
                }
            }

            // Update gross score color
            const grossCell = document.getElementById(`gross-${playerId}-${holeIndex + 1}`);
            if (grossCell && grossScore) {
                const par = getPar(holeIndex);
                grossCell.className = 'score-input border transition-colors ' + getScoreClass(grossScore, par);
            }

            updateTotals();
            updateMatchPlay();
            updateRankings();
            updateAchievements();
        }

        function getPar(holeIndex) {
            const parInputs = document.querySelectorAll('.scorecard-grid:nth-child(2) input');
            return parseInt(parInputs[holeIndex].value) || 4;
        }

        function getScoreClass(score, par) {
            const diff = score - par;
            if (diff <= -3) return 'albatross';
            if (diff === -2) return 'eagle';
            if (diff === -1) return 'birdie';
            if (diff === 0) return 'par';
            if (diff === 1) return 'bogey';
            if (diff === 2) return 'double-bogey';
            return 'triple-bogey';
        }

        function updateTotals() {
            // Update par total
            const parInputs = document.querySelectorAll('.scorecard-grid:nth-child(2) input');
            const parTotal = Array.from(parInputs).reduce((sum, input) => sum + (parseInt(input.value) || 0), 0);
            document.getElementById('parTotal').textContent = parTotal;

            // Update player totals
            players.forEach(player => {
                const grossTotal = player.scores.reduce((sum, score) => sum + (parseInt(score) || 0), 0);
                const netTotal = calculateNetTotal(player);
                
                player.grossTotal = grossTotal;
                player.netTotal = netTotal;

                // Update displays
                const grossDisplay = document.getElementById(`gross-${player.id}`);
                const netDisplay = document.getElementById(`net-${player.id}`);
                const grossTotalDisplay = document.getElementById(`grossTotal-${player.id}`);
                const netTotalDisplay = document.getElementById(`netTotal-${player.id}`);

                if (grossDisplay) grossDisplay.textContent = grossTotal || 0;
                if (netDisplay) netDisplay.textContent = netTotal || 0;
                if (grossTotalDisplay) grossTotalDisplay.textContent = grossTotal || 0;
                if (netTotalDisplay) netTotalDisplay.textContent = netTotal || 0;
            });
        }

        function calculateNetTotal(player) {
            let netTotal = 0;
            const holeHandicaps = Array.from(document.querySelectorAll('.scorecard-grid:nth-child(3) input')).map(input => parseInt(input.value) || 18);
            
            player.scores.forEach((score, i) => {
                if (score) {
                    const holeHandicap = holeHandicaps[i];
                    let strokesReceived = 0;
                    if (player.handicap >= holeHandicap) {
                        strokesReceived = Math.floor(player.handicap / 18) + (player.handicap % 18 >= holeHandicap ? 1 : 0);
                    }
                    netTotal += score - strokesReceived;
                }
            });
            
            return netTotal;
        }

        function updateMatchPlay() {
            if (players.length < 2) return;

            // Enhanced match play between all players
            for (let p1 = 0; p1 < players.length; p1++) {
                for (let p2 = p1 + 1; p2 < players.length; p2++) {
                    const player1 = players[p1];
                    const player2 = players[p2];
                    let matchScore = 0;

                    const holeHandicaps = Array.from(document.querySelectorAll('.scorecard-grid:nth-child(3) input')).map(input => parseInt(input.value) || 18);

                    for (let i = 0; i < 18; i++) {
                        const p1Gross = player1.scores[i];
                        const p2Gross = player2.scores[i];

                        if (p1Gross && p2Gross) {
                            const p1Strokes = player1.handicap >= holeHandicaps[i] ? 
                                Math.floor(player1.handicap / 18) + (player1.handicap % 18 >= holeHandicaps[i] ? 1 : 0) : 0;
                            const p2Strokes = player2.handicap >= holeHandicaps[i] ? 
                                Math.floor(player2.handicap / 18) + (player2.handicap % 18 >= holeHandicaps[i] ? 1 : 0) : 0;

                            const p1Net = p1Gross - p1Strokes;
                            const p2Net = p2Gross - p2Strokes;

                            if (p1Net < p2Net) {
                                matchScore++;
                            } else if (p1Net > p2Net) {
                                matchScore--;
                            }

                            // Update match display for first two players only (primary match)
                            if (p1 === 0 && p2 === 1) {
                                const match1Cell = document.getElementById(`match-${player1.id}-${i+1}`);
                                const match2Cell = document.getElementById(`match-${player2.id}-${i+1}`);
                                
                                if (match1Cell && match2Cell) {
                                    if (p1Net < p2Net) {
                                        match1Cell.className = 'hole-cell border text-xs font-bold match-win transition-colors';
                                        match1Cell.textContent = '1UP';
                                        match2Cell.className = 'hole-cell border text-xs font-bold match-loss transition-colors';
                                        match2Cell.textContent = '1DN';
                                    } else if (p1Net > p2Net) {
                                        match1Cell.className = 'hole-cell border text-xs font-bold match-loss transition-colors';
                                        match1Cell.textContent = '1DN';
                                        match2Cell.className = 'hole-cell border text-xs font-bold match-win transition-colors';
                                        match2Cell.textContent = '1UP';
                                    } else {
                                        match1Cell.className = 'hole-cell border text-xs font-bold match-tie transition-colors';
                                        match1Cell.textContent = 'AS';
                                        match2Cell.className = 'hole-cell border text-xs font-bold match-tie transition-colors';
                                        match2Cell.textContent = 'AS';
                                    }
                                }
                            }
                        }
                    }

                    // Update match totals for first two players
                    if (p1 === 0 && p2 === 1) {
                        const matchTotal1 = document.getElementById(`matchTotal-${player1.id}`);
                        const matchTotal2 = document.getElementById(`matchTotal-${player2.id}`);
                        const matchTotalHeader1 = document.getElementById(`match-total-${player1.id}`);
                        const matchTotalHeader2 = document.getElementById(`match-total-${player2.id}`);

                        let matchResult = '';
                        if (matchScore > 0) {
                            matchResult = `${matchScore}UP`;
                        } else if (matchScore < 0) {
                            matchResult = `${Math.abs(matchScore)}DN`;
                        } else {
                            matchResult = 'AS';
                        }

                        if (matchTotal1) matchTotal1.textContent = matchResult;
                        if (matchTotal2) matchTotal2.textContent = matchScore > 0 ? `${matchScore}DN` : matchScore < 0 ? `${Math.abs(matchScore)}UP` : 'AS';
                        if (matchTotalHeader1) matchTotalHeader1.textContent = `Match: ${matchResult}`;
                        if (matchTotalHeader2) matchTotalHeader2.textContent = `Match: ${matchScore > 0 ? `${matchScore}DN` : matchScore < 0 ? `${Math.abs(matchScore)}UP` : 'AS'}`;
                    }
                }
            }
        }

        function updateRankings() {
            // Enhanced Gross ranking
            const grossSorted = [...players]
                .filter(p => p.grossTotal > 0)
                .sort((a, b) => a.grossTotal - b.grossTotal);
            
            const grossContainer = document.getElementById('grossRanking');
            grossContainer.innerHTML = '';
            
            if (grossSorted.length === 0) {
                grossContainer.innerHTML = `
                    <div class="text-center py-8 text-gray-400">
                        <i class="fas fa-chart-line text-4xl mb-3"></i>
                        <p>Leaderboard will appear here</p>
                    </div>`;
            } else {
                grossSorted.forEach((player, index) => {
                    const div = document.createElement('div');
                    div.className = `ranking-card flex items-center justify-between p-4 rounded-xl border-2 ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-400' : 
                        index === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-400' :
                        index === 2 ? 'bg-gradient-to-r from-orange-100 to-orange-200 border-orange-400' :
                        'bg-gray-50 border-gray-200'
                    }`;
                    
                    const parTotal = parseInt(document.getElementById('parTotal').textContent) || 72;
                    const scoreToPar = player.grossTotal - parTotal;
                    const scoreToParText = scoreToPar === 0 ? 'E' : scoreToPar > 0 ? `+${scoreToPar}` : `${scoreToPar}`;
                    
                    div.innerHTML = `
                        <div class="flex items-center space-x-4">
                            <div class="text-2xl">
                                ${index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : 
                                `<div class="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">${index + 1}</div>`}
                            </div>
                            <div>
                                <div class="font-bold text-lg text-gray-800">${player.name}</div>
                                <div class="text-sm text-gray-600">HCP: ${player.handicap}</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="font-bold text-2xl ${scoreToPar < 0 ? 'text-green-600' : scoreToPar > 0 ? 'text-red-600' : 'text-blue-600'}">${player.grossTotal}</div>
                            <div class="text-sm font-semibold ${scoreToPar < 0 ? 'text-green-600' : scoreToPar > 0 ? 'text-red-600' : 'text-blue-600'}">${scoreToParText}</div>
                        </div>
                    `;
                    grossContainer.appendChild(div);
                });
            }

            // Enhanced Net ranking
            const netSorted = [...players]
                .filter(p => p.netTotal > 0)
                .sort((a, b) => a.netTotal - b.netTotal);
            
            const netContainer = document.getElementById('netRanking');
            netContainer.innerHTML = '';
            
            if (netSorted.length === 0) {
                netContainer.innerHTML = `
                    <div class="text-center py-8 text-gray-400">
                        <i class="fas fa-chart-line text-4xl mb-3"></i>
                        <p>Net rankings will appear here</p>
                    </div>`;
            } else {
                netSorted.forEach((player, index) => {
                    const div = document.createElement('div');
                    div.className = `ranking-card flex items-center justify-between p-4 rounded-xl border-2 ${
                        index === 0 ? 'bg-gradient-to-r from-green-100 to-green-200 border-green-400' : 
                        index === 1 ? 'bg-gradient-to-r from-blue-100 to-blue-200 border-blue-400' :
                        index === 2 ? 'bg-gradient-to-r from-purple-100 to-purple-200 border-purple-400' :
                        'bg-gray-50 border-gray-200'
                    }`;
                    
                    const parTotal = parseInt(document.getElementById('parTotal').textContent) || 72;
                    const scoreToPar = player.netTotal - parTotal;
                    const scoreToParText = scoreToPar === 0 ? 'E' : scoreToPar > 0 ? `+${scoreToPar}` : `${scoreToPar}`;
                    
                    div.innerHTML = `
                        <div class="flex items-center space-x-4">
                            <div class="text-2xl">
                                ${index === 0 ? '🎯' : index === 1 ? '🥈' : index === 2 ? '🥉' : 
                                `<div class="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">${index + 1}</div>`}
                            </div>
                            <div>
                                <div class="font-bold text-lg text-gray-800">${player.name}</div>
                                <div class="text-sm text-gray-600">HCP: ${player.handicap}</div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="font-bold text-2xl ${scoreToPar < 0 ? 'text-green-600' : scoreToPar > 0 ? 'text-red-600' : 'text-blue-600'}">${player.netTotal}</div>
                            <div class="text-sm font-semibold ${scoreToPar < 0 ? 'text-green-600' : scoreToPar > 0 ? 'text-red-600' : 'text-blue-600'}">${scoreToParText}</div>
                        </div>
                    `;
                    netContainer.appendChild(div);
                });
            }

            // Update match play results
            updateMatchPlayResults();
        }

        function updateAchievements() {
            const achievementsContainer = document.getElementById('achievementsContainer');
            let allAchievements = [];

            players.forEach(player => {
                const playerAchievements = checkAchievements(player);
                allAchievements.push(...playerAchievements);
            });

            if (allAchievements.length === 0) {
                achievementsContainer.innerHTML = `
                    <div class="text-center py-8 text-gray-400">
                        <i class="fas fa-star text-4xl mb-3"></i>
                        <p>Achievements unlock as you play!</p>
                    </div>`;
                return;
            }

            achievementsContainer.innerHTML = '';
            allAchievements.forEach(achievement => {
                const div = document.createElement('div');
                div.className = 'achievement-badge bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400 p-3 rounded-xl';
                div.innerHTML = `
                    <div class="flex items-center space-x-3">
                        <div class="text-2xl">${achievement.icon}</div>
                        <div>
                            <div class="font-bold text-gray-800">${achievement.title}</div>
                            <div class="text-sm text-gray-600">${achievement.player}</div>
                        </div>
                    </div>
                `;
                achievementsContainer.appendChild(div);
            });
        }

        function checkAchievements(player) {
            const achievements = [];
            const pars = Array.from(document.querySelectorAll('.scorecard-grid:nth-child(2) input')).map(input => parseInt(input.value) || 4);
            
            // Check for special scores
            player.scores.forEach((score, i) => {
                if (score) {
                    const par = pars[i];
                    const diff = score - par;
                    
                    if (diff <= -3) achievements.push({
                        title: `Albatross on Hole ${i + 1}!`,
                        player: player.name,
                        icon: '🦅',
                        type: 'albatross'
                    });
                    else if (diff === -2) achievements.push({
                        title: `Eagle on Hole ${i + 1}!`,
                        player: player.name,
                        icon: '🦅',
                        type: 'eagle'
                    });
                    else if (diff === -1) achievements.push({
                        title: `Birdie on Hole ${i + 1}!`,
                        player: player.name,
                        icon: '🐦',
                        type: 'birdie'
                    });
                    
                    if (score === 1) achievements.push({
                        title: `Hole in One on Hole ${i + 1}!`,
                        player: player.name,
                        icon: '⭐',
                        type: 'holeinone'
                    });
                }
            });

            // Check for streaks
            let parStreak = 0;
            let birdieStreak = 0;
            let maxParStreak = 0;
            let maxBirdieStreak = 0;

            player.scores.forEach((score, i) => {
                if (score) {
                    const par = pars[i];
                    if (score === par) {
                        parStreak++;
                        maxParStreak = Math.max(maxParStreak, parStreak);
                        birdieStreak = 0;
                    } else if (score === par - 1) {
                        birdieStreak++;
                        maxBirdieStreak = Math.max(maxBirdieStreak, birdieStreak);
                        parStreak = 0;
                    } else {
                        parStreak = 0;
                        birdieStreak = 0;
                    }
                }
            });

            if (maxParStreak >= 3) {
                achievements.push({
                    title: `${maxParStreak} Consecutive Pars!`,
                    player: player.name,
                    icon: '🎯',
                    type: 'parstreak'
                });
            }

            if (maxBirdieStreak >= 2) {
                achievements.push({
                    title: `${maxBirdieStreak} Consecutive Birdies!`,
                    player: player.name,
                    icon: '🔥',
                    type: 'birdiestreak'
                });
            }

            // Score-based achievements
            const parTotal = parseInt(document.getElementById('parTotal').textContent) || 72;
            if (player.grossTotal > 0) {
                if (player.grossTotal < parTotal) {
                    achievements.push({
                        title: 'Under Par Round!',
                        player: player.name,
                        icon: '🏆',
                        type: 'underpar'
                    });
                }
                
                if (player.netTotal > 0 && player.netTotal < parTotal - 5) {
                    achievements.push({
                        title: 'Net Score Excellence!',
                        player: player.name,
                        icon: '💎',
                        type: 'netexcellence'
                    });
                }
            }

            return achievements;
        }

        function updateMatchPlayResults() {
            const matchContainer = document.getElementById('matchPlayResults');
            matchContainer.innerHTML = '';

            if (players.length >= 2) {
                for (let i = 0; i < players.length; i++) {
                    for (let j = i + 1; j < players.length; j++) {
                        const player1 = players[i];
                        const player2 = players[j];
                        
                        let matchScore = calculateMatchResult(player1, player2);
                        
                        const div = document.createElement('div');
                        div.className = 'flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200';
                        
                        let resultText = '';
                        let resultClass = '';
                        let resultIcon = '';
                        
                        if (matchScore > 0) {
                            resultText = `${player1.name} wins ${matchScore}UP`;
                            resultClass = 'text-green-600 font-bold';
                            resultIcon = '🏆';
                        } else if (matchScore < 0) {
                            resultText = `${player2.name} wins ${Math.abs(matchScore)}UP`;
                            resultClass = 'text-green-600 font-bold';
                            resultIcon = '🏆';
                        } else {
                            resultText = 'All Square';
                            resultClass = 'text-blue-600 font-bold';
                            resultIcon = '🤝';
                        }
                        
                        div.innerHTML = `
                            <div class="flex items-center space-x-4">
                                <div class="text-2xl">${resultIcon}</div>
                                <div>
                                    <div class="font-bold text-gray-800">${player1.name} vs ${player2.name}</div>
                                    <div class="text-sm text-gray-600">Head-to-Head Match</div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="${resultClass}">${resultText}</div>
                            </div>
                        `;
                        
                        matchContainer.appendChild(div);
                    }
                }
            } else {
                matchContainer.innerHTML = `
                    <div class="text-center py-8 text-gray-400">
                        <i class="fas fa-swords text-4xl mb-3"></i>
                        <p>Add at least 2 players for match play</p>
                    </div>`;
            }
        }

        function calculateMatchResult(player1, player2) {
            let matchScore = 0;
            const holeHandicaps = Array.from(document.querySelectorAll('.scorecard-grid:nth-child(3) input')).map(input => parseInt(input.value) || 18);

            for (let i = 0; i < 18; i++) {
                const p1Gross = player1.scores[i];
                const p2Gross = player2.scores[i];

                if (p1Gross && p2Gross) {
                    const p1Strokes = player1.handicap >= holeHandicaps[i] ? 
                        Math.floor(player1.handicap / 18) + (player1.handicap % 18 >= holeHandicaps[i] ? 1 : 0) : 0;
                    const p2Strokes = player2.handicap >= holeHandicaps[i] ? 
                        Math.floor(player2.handicap / 18) + (player2.handicap % 18 >= holeHandicaps[i] ? 1 : 0) : 0;

                    const p1Net = p1Gross - p1Strokes;
                    const p2Net = p2Gross - p2Strokes;

                    if (p1Net < p2Net) {
                        matchScore++;
                    } else if (p1Net > p2Net) {
                        matchScore--;
                    }
                }
            }

            return matchScore;
        }

        function resetScorecard() {
            if (confirm('⚠️ Are you sure you want to reset all scores? This action cannot be undone.')) {
                players = [];
                playerId = 0;
                document.getElementById('courseName').value = '';
                document.getElementById('gameDate').valueAsDate = new Date();
                renderPlayers();
                updateRankings();
                updateAchievements();
            }
        }

      function exportToPDF() {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('landscape');
            
            // Header
            pdf.setFontSize(20);
            pdf.setTextColor(16, 185, 129);
            pdf.text('GRITNEXUS Golf Scorecard Pro', 20, 20);
            
            const courseName = document.getElementById('courseName').value || 'Golf Course';
            const gameDate = document.getElementById('gameDate').value || new Date().toISOString().split('T')[0];
            
            pdf.setFontSize(12);
            pdf.setTextColor(0, 0, 0);
            pdf.text(`Course: ${courseName}`, 20, 35);
            pdf.text(`Date: ${gameDate}`, 20, 45);
            
            let yPosition = 60;
            
            // Course par information
            pdf.setFontSize(10);
            pdf.text('Hole:', 20, yPosition);
            const parInputs = document.querySelectorAll('.scorecard-grid:nth-child(2) input');
            const hcpInputs = document.querySelectorAll('.scorecard-grid:nth-child(3) input');
            
            for (let i = 0; i < 18; i++) {
                pdf.text(`${i + 1}`, 35 + (i * 12), yPosition);
            }
            pdf.text('Total', 250, yPosition);
            
            yPosition += 10;
            pdf.text('Par:', 20, yPosition);
            let parTotal = 0;
            for (let i = 0; i < parInputs.length; i++) {
                const par = parseInt(parInputs[i].value) || 4;
                parTotal += par;
                pdf.text(`${par}`, 35 + (i * 12), yPosition);
            }
            pdf.text(`${parTotal}`, 250, yPosition);
            
            yPosition += 10;
            pdf.text('HCP:', 20, yPosition);
            for (let i = 0; i < hcpInputs.length; i++) {
                const hcp = parseInt(hcpInputs[i].value) || 1;
                pdf.text(`${hcp}`, 35 + (i * 12), yPosition);
            }
            
            yPosition += 15;
            
            // Player scores
            players.forEach((player, index) => {
                pdf.setFontSize(10);
                pdf.text(`${player.name} (HCP: ${player.handicap})`, 20, yPosition);
                
                for (let i = 0; i < 18; i++) {
                    const score = player.scores[i] || '-';
                    pdf.text(`${score}`, 35 + (i * 12), yPosition);
                }
                pdf.text(`${player.grossTotal}`, 250, yPosition);
                
                yPosition += 8;
                pdf.setFontSize(8);
                pdf.text('Net:', 20, yPosition);
                
                for (let i = 0; i < 18; i++) {
                    const netCell = document.getElementById(`net-${player.id}-${i+1}`);
                    const netScore = netCell ? netCell.textContent : '-';
                    pdf.text(`${netScore}`, 35 + (i * 12), yPosition);
                }
                pdf.text(`${player.netTotal}`, 250, yPosition);
                
                yPosition += 15;
            });
            
            // Save the PDF
            pdf.save(`${courseName}_${gameDate}_scorecard.pdf`);
        }

        function printScorecard() {
            window.print();
        }

        // Game type change handler
        document.getElementById('gameType').addEventListener('change', function() {
            const gameType = this.value;
            const matchSection = document.getElementById('matchPlaySection');
            matchSection.style.display = (gameType === 'match' || gameType === 'both') ? 'block' : 'none';
        });

        // Course name and date change handlers
        document.getElementById('courseName').addEventListener('change', function() {
            updateCourseDisplay();
        });

        document.getElementById('gameDate').addEventListener('change', function() {
            updateCourseDisplay();
        });

        function updateCourseDisplay() {
            const courseName = document.getElementById('courseName').value;
            const gameDate = document.getElementById('gameDate').value;
            document.getElementById('courseDisplay').textContent = `Course: ${courseName || 'Not Set'}`;
            document.getElementById('dateDisplay').textContent = `Date: ${gameDate || 'Not Set'}`;
        }

        // Auto-save functionality
        function saveToLocalStorage() {
            const data = {
                players: players,
                courseName: document.getElementById('courseName').value,
                gameDate: document.getElementById('gameDate').value,
                gameType: document.getElementById('gameType').value,
                parValues: Array.from(document.querySelectorAll('.scorecard-grid:nth-child(2) input')).map(input => input.value),
                hcpValues: Array.from(document.querySelectorAll('.scorecard-grid:nth-child(3) input')).map(input => input.value)
            };
            localStorage.setItem('golfScorecard', JSON.stringify(data));
        }

        function loadFromLocalStorage() {
            try {
                const saved = localStorage.getItem('golfScorecard');
                if (saved) {
                    const data = JSON.parse(saved);
                    
                    // Restore basic info
                    document.getElementById('courseName').value = data.courseName || '';
                    document.getElementById('gameDate').value = data.gameDate || '';
                    document.getElementById('gameType').value = data.gameType || 'stroke';
                    
                    // Restore par values
                    if (data.parValues) {
                        const parInputs = document.querySelectorAll('.scorecard-grid:nth-child(2) input');
                        data.parValues.forEach((value, index) => {
                            if (parInputs[index]) parInputs[index].value = value;
                        });
                    }
                    
                    // Restore handicap values
                    if (data.hcpValues) {
                        const hcpInputs = document.querySelectorAll('.scorecard-grid:nth-child(3) input');
                        data.hcpValues.forEach((value, index) => {
                            if (hcpInputs[index]) hcpInputs[index].value = value;
                        });
                    }
                    
                    // Restore players
                    if (data.players) {
                        players = data.players;
                        playerId = Math.max(0, ...players.map(p => p.id));
                        renderPlayers();
                        
                        // Restore scores
                        players.forEach(player => {
                            player.scores.forEach((score, holeIndex) => {
                                if (score) {
                                    const input = document.getElementById(`gross-${player.id}-${holeIndex + 1}`);
                                    if (input) {
                                        input.value = score;
                                        updatePlayerScore(player.id, holeIndex, score, 'gross');
                                    }
                                }
                            });
                        });
                    }
                    
                    updateTotals();
                    updateRankings();
                    updateAchievements();
                    updateCourseDisplay();
                }
            } catch (error) {
                console.warn('Could not load saved data:', error);
            }
        }

        // Auto-save on changes
        setInterval(saveToLocalStorage, 5000); // Save every 5 seconds

        // Load saved data on page load
        window.addEventListener('load', loadFromLocalStorage);

        // Prevent accidental page refresh
        window.addEventListener('beforeunload', function(e) {
            if (players.length > 0) {
                e.preventDefault();
                e.returnValue = 'You have unsaved scorecard data. Are you sure you want to leave?';
            }
        });
