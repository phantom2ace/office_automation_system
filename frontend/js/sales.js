const API_BASE_URL = '';
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  loadDeals();
  loadLeads();
  loadCustomers();
  
  // User permissions check
  if (user.role === 'Admin') {
    document.getElementById('nav-users').style.display = 'block';
  }
});

function switchView(viewName) {
  // Hide all views
  document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.view-btn').forEach(el => el.classList.remove('active'));
  
  // Show selected
  document.getElementById(viewName + 'View').style.display = 'block';
  // Highlight button (simple logic)
  const buttons = document.querySelectorAll('.view-btn');
  if (viewName === 'pipeline') buttons[0].classList.add('active');
  if (viewName === 'leads') buttons[1].classList.add('active');
  if (viewName === 'customers') buttons[2].classList.add('active');
}

// ================= PIPELINE / DEALS =================

function loadDeals() {
  fetch('/api/sales/deals', {
    headers: { 'userid': user.id, 'Authorization': user.token }
  })
  .then(res => res.json())
  .then(deals => {
    // Clear columns
    document.querySelectorAll('.kanban-cards').forEach(el => el.innerHTML = '');
    
    deals.forEach(deal => {
      const card = createDealCard(deal);
      const colId = getColumnId(deal.stage);
      const col = document.getElementById(colId);
      if (col) {
        col.querySelector('.kanban-cards').appendChild(card);
      }
    });
    
    updateCounts();
  })
  .catch(err => console.error(err));
}

function getColumnId(stage) {
  if (stage === 'Prospecting') return 'col-prospecting';
  if (stage === 'Qualification') return 'col-qualification';
  if (stage === 'Proposal') return 'col-proposal';
  if (stage === 'Negotiation') return 'col-negotiation';
  if (stage === 'Closed Won') return 'col-won';
  return 'col-prospecting'; // Default
}

function createDealCard(deal) {
  const div = document.createElement('div');
  div.className = 'deal-card';
  div.draggable = true;
  div.dataset.id = deal.id;
  div.ondragstart = drag;
  
  div.innerHTML = `
    <div class="deal-title">${deal.title}</div>
    <div class="deal-value">$${deal.value.toLocaleString()}</div>
    <div class="deal-customer">${deal.customerName || 'Unknown Customer'}</div>
  `;
  return div;
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.dataset.id);
}

function drop(ev, newStage) {
  ev.preventDefault();
  const dealId = ev.dataTransfer.getData("text");
  
  // Update UI immediately (optimistic)
  const card = document.querySelector(`.deal-card[data-id="${dealId}"]`);
  const targetColumn = ev.target.closest('.kanban-column').querySelector('.kanban-cards');
  targetColumn.appendChild(card);
  updateCounts();
  
  // Update Backend
  fetch(`/api/sales/deals/${dealId}/stage`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'userid': user.id,
      'role': user.role
    },
    body: JSON.stringify({ stage: newStage })
  });
}

function updateCounts() {
  document.querySelectorAll('.kanban-column').forEach(col => {
    const count = col.querySelectorAll('.deal-card').length;
    col.querySelector('.count').textContent = count;
  });
}

function showNewDealModal() {
  // Populate customers dropdown first
  fetch('/api/sales/customers', {
    headers: { 'userid': user.id }
  })
  .then(res => res.json())
  .then(customers => {
    const select = document.getElementById('dealCustomer');
    select.innerHTML = '<option value="">Select Customer</option>' + 
      customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    
    document.getElementById('dealModal').style.display = 'block';
  });
}

function handleDealSubmit(e) {
  e.preventDefault();
  const data = {
    title: document.getElementById('dealTitle').value,
    customerId: document.getElementById('dealCustomer').value,
    value: document.getElementById('dealValue').value,
    stage: document.getElementById('dealStage').value,
    expectedCloseDate: document.getElementById('dealDate').value
  };
  
  fetch('/api/sales/deals', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'userid': user.id,
      'role': user.role
    },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(() => {
    closeModal('dealModal');
    loadDeals();
  });
}

// ================= LEADS =================

function loadLeads() {
  fetch('/api/sales/leads', {
    headers: { 'userid': user.id }
  })
  .then(res => res.json())
  .then(leads => {
    const tbody = document.getElementById('leadsTableBody');
    tbody.innerHTML = leads.map(lead => `
      <tr>
        <td>
          <div style="font-weight: 500;">${lead.name}</div>
          <div style="font-size: 12px; color: #666;">${lead.email}</div>
        </td>
        <td>${lead.company || '-'}</td>
        <td><span class="status-badge status-${lead.status.toLowerCase()}">${lead.status}</span></td>
        <td>${lead.phone || '-'}</td>
        <td>${lead.source || '-'}</td>
        <td>
          ${lead.status !== 'Converted' ? 
            `<button onclick="convertLead(${lead.id})" style="padding: 4px 8px; font-size: 12px; cursor: pointer;">Convert</button>` : 
            '<span style="color: green;">✓</span>'}
        </td>
      </tr>
    `).join('');
  });
}

function showNewLeadModal() {
  document.getElementById('leadModal').style.display = 'block';
}

function handleLeadSubmit(e) {
  e.preventDefault();
  const data = {
    name: document.getElementById('leadName').value,
    company: document.getElementById('leadCompany').value,
    email: document.getElementById('leadEmail').value,
    phone: document.getElementById('leadPhone').value,
    source: document.getElementById('leadSource').value
  };
  
  fetch('http://localhost:3000/api/sales/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'userid': user.id },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(() => {
    closeModal('leadModal');
    loadLeads();
  });
}

function convertLead(id) {
  if(!confirm('Convert this lead to a customer?')) return;
  
  fetch(`/api/sales/leads/${id}/convert`, {
    method: 'POST',
    headers: { 'userid': user.id }
  })
  .then(res => res.json())
  .then(() => {
    loadLeads();
    loadCustomers();
  });
}

// ================= CUSTOMERS =================

function loadCustomers() {
  fetch('/api/sales/customers', {
    headers: { 
      'userid': user.id,
      'role': user.role
    }
  })
  .then(res => res.json())
  .then(customers => {
    const tbody = document.getElementById('customersTableBody');
    tbody.innerHTML = customers.map(c => `
      <tr>
        <td>
          <div style="font-weight: 500;">${c.name}</div>
          <div style="font-size: 12px; color: #666;">${c.company}</div>
        </td>
        <td>${c.industry || '-'}</td>
        <td>${c.email}<br>${c.phone}</td>
        <td>${c.address || '-'}</td>
        <td>
          <button style="padding: 4px 8px;">View</button>
        </td>
      </tr>
    `).join('');
  });
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

// Close modals when clicking outside
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = "none";
  }
}
