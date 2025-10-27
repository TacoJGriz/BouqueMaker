document.addEventListener('DOMContentLoaded', () => {
  // --- Page Elements ---
  const startPage = document.getElementById('start-page');
  const selectorPage = document.getElementById('selector-page');
  const resultPage = document.getElementById('result-page');
  const flowerGroupsContainer = document.getElementById('flower-groups-container');
  const currentTotalSpan = document.getElementById('current-total');
  const errorContainerDiv = document.getElementById('error-container');
  // --- Buttons ---
  const startButton = document.getElementById('start-button');
  const addFlowerGroupButton = document.getElementById('add-flower-group-btn');
  const viewBouquetButton = document.getElementById('view-bouquet-button');

  // --- Constraints and Options ---
  const MAX_BOUQUET_SIZE = 15;
  const FLOWER_TYPES = ['Roses', 'Tulips', 'Bluebonnets', 'Lilies', 'Daisies'];
  const COLORS = ['Red', 'Yellow', 'Blue', 'Pink', 'White', 'Purple'];
  const STEM_COLORS = ['Green', 'Brown', 'Light Green'];

  let groupCounter = 0;

  // --- Core Functionality: Switch Pages ---
  function showPage(pageToShow) {
    const allPages = [startPage, selectorPage, resultPage];
    allPages.forEach(page => page.classList.remove('active'));
    pageToShow.classList.add('active');
  }

  // --- Function to Show the Error Pop-up ---
  function showErrorPopup() {
    // Clear any existing timer
    clearTimeout(window.errorTimer);

    // Show the message
    errorContainerDiv.style.display = 'block';
    // Hide the message after 3 seconds
    window.errorTimer = setTimeout(() => {
      errorContainerDiv.style.display = 'none';
    }, 3000);
  }

  // --- Quantity Management Function (Updated) ---
  function updateTotalQuantity(currentInput = null) {
    let currentTotal = 0;
    let inputs = document.querySelectorAll('.quantity-input');
    let wasCapped = false; // Flag to check if we need to show the error

    // 1. Calculate the total of all *other* inputs
    inputs.forEach(input => {
      if (input !== currentInput) {
        currentTotal += parseInt(input.value) || 0;
      }
    });

    // 2. Handle the current input field (if provided)
    if (currentInput) {
      let requestedValue = parseInt(currentInput.value) || 0;
      const remainingCapacity = MAX_BOUQUET_SIZE - currentTotal;

      if (requestedValue > remainingCapacity) {
        // User tried to go over the limit!
        currentInput.value = Math.max(0, remainingCapacity);
        requestedValue = parseInt(currentInput.value);
        wasCapped = true; // Set the flag
      }
      currentTotal += requestedValue;
    } else {
      // If no specific input, just sum all for deletion/load events
      currentTotal = 0;
      inputs.forEach(input => {
        currentTotal += parseInt(input.value) || 0;
      });
    }

    // 3. Show error if the user's input was limited
    if (wasCapped) {
      showErrorPopup();
    }


    currentTotalSpan.textContent = currentTotal;

    // 4. Update UI based on final total
    if (currentTotal === MAX_BOUQUET_SIZE) {
      currentTotalSpan.style.color = '#e91e63';
      viewBouquetButton.disabled = false;
    } else {
      currentTotalSpan.style.color = '#333';
      viewBouquetButton.disabled = false;
    }

    // Disable "Add Flower Type" button if the bouquet is full
    addFlowerGroupButton.disabled = currentTotal >= MAX_BOUQUET_SIZE;
    addFlowerGroupButton.textContent = currentTotal >= MAX_BOUQUET_SIZE ?
      'Limit Reached (15)' : '+ Add Flower Type';
  }


  // --- Dynamic Group Generation Function (Listeners Updated) ---
  function createFlowerGroup() {
    groupCounter++;
    const id = `group-${groupCounter}`;

    // (HTML structure remains the same)
    const groupHTML = `
            <div class="flower-group" id="${id}">
                <h4>Flower Group #${groupCounter} <button class="remove-group-btn" data-group-id="${id}">Remove</button></h4>
                <div class="selection-grid">
                    <div class="selection-box">
                        <h3>Quantity (Max 15)</h3>
                        <input type="number" class="quantity-input" min="0" max="15" value="1" data-field="quantity">
                    </div>
                    <div class="selection-box">
                        <h3>Flower Type</h3>
                        <select class="type-select" data-field="type">
                            ${FLOWER_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}
                        </select>
                    </div>
                    <div class="selection-box">
                        <h3>Flower Color</h3>
                        <select class="color-select" data-field="color">
                            ${COLORS.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="selection-box">
                        <h3>Stem Color (Optional Accent)</h3>
                        <select class="stem-select" data-field="stem">
                            ${STEM_COLORS.map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>
        `;

    flowerGroupsContainer.insertAdjacentHTML('beforeend', groupHTML);

    // Attach listener to the new quantity input
    const newGroupElement = document.getElementById(id);
    const newQuantityInput = newGroupElement.querySelector('.quantity-input');

    newQuantityInput.addEventListener('input', (event) => {
      updateTotalQuantity(event.target);
    });

    updateTotalQuantity();
  }

  // --- Event Listeners for Page Flow (Simplified) ---

  startButton.addEventListener('click', () => {
    showPage(selectorPage);
    if (flowerGroupsContainer.children.length === 0) {
      createFlowerGroup();
    }
  });

  addFlowerGroupButton.addEventListener('click', createFlowerGroup);

  // Remove Flower Group (Delegated Listener)
  flowerGroupsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-group-btn')) {
      const groupElement = event.target.closest('.flower-group');
      if (groupElement) {
        groupElement.remove();
      }
      updateTotalQuantity();
    }
  });

  // Delegated listener for all quantity inputs
  flowerGroupsContainer.addEventListener('input', (event) => {
    if (event.target.classList.contains('quantity-input')) {
      updateTotalQuantity(event.target);
    }
  });


  // Selector Page -> Result Page (Final Step/Summary)
  viewBouquetButton.addEventListener('click', () => {
    // (Summary generation logic remains the same)
    updateTotalQuantity();

    const wrapping = document.getElementById('wrapping').value;
    const description = document.getElementById('description').value;
    const summaryDiv = document.getElementById('bouquet-summary');

    const flowerGroups = [];
    let totalFlowers = 0;

    document.querySelectorAll('.flower-group').forEach((groupElement) => {
      const quantity = parseInt(groupElement.querySelector('.quantity-input').value) || 0;
      const type = groupElement.querySelector('.type-select').value;
      const color = groupElement.querySelector('.color-select').value;
      const stem = groupElement.querySelector('.stem-select').value;

      totalFlowers += quantity;

      if (quantity > 0) {
        flowerGroups.push({
          quantity: quantity,
          type: type,
          color: color,
          stem: stem
        });
      }
    });

    // Build the Summary HTML
    let summaryHTML = '<h3>Flower Components:</h3>';
    // ... (rest of summary logic)
    if (flowerGroups.length > 0) {
      summaryHTML += '<ul>';
      flowerGroups.forEach(group => {
        summaryHTML += `<li><strong>${group.quantity}</strong> x ${group.color} ${group.type} (Stem Accent: ${group.stem})</li>`;
      });
      summaryHTML += '</ul>';
    } else {
      summaryHTML += '<p>No flowers selected.</p>';
    }
    summaryHTML += `<hr><p><strong>Total Flowers:</strong> ${totalFlowers}</p><p><strong>Bouquet Wrapping:</strong> ${wrapping}</p>`;
    if (description.trim() !== '') {
      summaryHTML += `<hr><p><strong>Personal Vision:</strong></p><p>${description}</p>`;
    }

    summaryDiv.innerHTML = summaryHTML;

    showPage(resultPage);
  });

  // Initialization
  if (flowerGroupsContainer.children.length === 0) {
    createFlowerGroup();
  }
  updateTotalQuantity();
});
