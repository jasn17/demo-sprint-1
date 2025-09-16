// About page initialization
import { qs } from '../lib/dom.js';
import { loadJSON, DATA } from '../lib/api.js';
import { createErrorCard } from '../lib/ui.js';

export async function initAbout() {
  const container = qs('.about-content');
  if (!container) return;

  try {
    const aboutData = await loadJSON(DATA.about);
    
    container.innerHTML = `
      <div class="about-card">
        <h2>${aboutData.productName}</h2>
        <p class="muted">${aboutData.description}</p>
        
        <div class="about-grid">
          <div>
            <div class="label">Group</div>
            <div>${aboutData.groupName}</div>
          </div>
          <div>
            <div class="label">Team</div>
            <div>${aboutData.team}</div>
          </div>
          <div>
            <div class="label">Version</div>
            <div>${aboutData.version}</div>
          </div>
          <div>
            <div class="label">Release Date</div>
            <div>${aboutData.releaseDate}</div>
          </div>
        </div>
        
        <div class="team-section">
          <h3>Team Members</h3>
          <ul class="team-list">
            ${aboutData.members.map(member => `<li>${member}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  } catch (e) {
    const errorCard = createErrorCard(
      'Could not load about information.',
      'Please check your connection and try again.'
    );
    container.appendChild(errorCard);
  }
}
