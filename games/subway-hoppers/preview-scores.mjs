// Local development preview: never connect to or write production scores.
export function currentPlayer(){return null;}
export function submitRun(){}
document.querySelector('#board-status').textContent='Local preview — online leaderboard disabled';
document.querySelector('#score-status').textContent='Preview runs do not update live scores.';
