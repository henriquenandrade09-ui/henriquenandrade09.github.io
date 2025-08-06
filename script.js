// Sistema de Gerenciamento SCP Área PT9
class SCPAreaPT9 {
    constructor() {
        this.currentUser = null;
        this.users = this.loadFromStorage('users') || [];
        this.documents = this.loadFromStorage('documents') || [];
        this.pendingUsers = this.loadFromStorage('pendingUsers') || [];
        this.reports = this.loadFromStorage('reports') || [];
        this.announcements = this.loadFromStorage('announcements') || [];
        this.complaints = this.loadFromStorage('complaints') || [];
        this.missions = this.loadFromStorage('missions') || [];
        this.scps = this.loadFromStorage('scps') || [];
        this.certifications = this.loadFromStorage('certifications') || [];
        this.incidents = this.loadFromStorage('incidents') || [];
        
        // Sistema de Segurança
        this.securitySystem = {
            isLocked: false,
            threatLevel: 0,
            lastScan: new Date(),
            blockedIPs: [],
            securityLog: []
        };

        // Status da Área PT9
        this.siteStatus = this.loadFromStorage('siteStatus') || {
            status: 'OPERACIONAL',
            lastUpdate: new Date(),
            updatedBy: 'Sistema'
        };

        // Usuários administrativos padrão
        this.adminUsers = [
            {
                email: 'henriquenandrade09@gmail.com',
                password: 'Bb170014',
                name: 'Henrique Nandrade',
                accessLevel: 6,
                managementLevel: 4, // GERÊNCIA 4 - PODERES ABSOLUTOS
                department: 'Administrativo',
                isApproved: true,
                isAdmin: true,
                isGodMode: true, // Modo Deus - acesso total
                registrationDate: new Date('2024-01-01'),
                lastLogin: null
            },
            {
                email: 'admin@area-pt9.scp',
                password: 'admin1234',
                name: 'Administrador Principal',
                accessLevel: 6,
                managementLevel: 3,
                department: 'Administrativo',
                isApproved: true,
                isAdmin: true,
                registrationDate: new Date('2024-01-01'),
                lastLogin: null
            },
            {
                email: 'gerente1@area-pt9.scp',
                password: 'ger1234',
                name: 'Gerente Nível 1',
                accessLevel: 5,
                managementLevel: 1,
                department: 'Administrativo',
                isApproved: true,
                isAdmin: true,
                registrationDate: new Date('2024-01-01'),
                lastLogin: null
            },
            {
                email: 'gerente2@area-pt9.scp',
                password: 'ger2345',
                name: 'Gerente Nível 2',
                accessLevel: 6,
                managementLevel: 2,
                department: 'Administrativo',
                isApproved: true,
                isAdmin: true,
                registrationDate: new Date('2024-01-01'),
                lastLogin: null
            }
        ];

        // Adicionar usuários admin se não existirem
        this.adminUsers.forEach(admin => {
            if (!this.users.find(u => u.email === admin.email)) {
                this.users.push(admin);
            }
        });

        this.init();
    }

    init() {
        this.updateTime();
        this.setupEventListeners();
        this.loadSampleData();
        this.initSecuritySystem();
        this.updateSiteStatus();
        this.updateSouthPoleTemperature();
        this.initSCPDatabase();
        this.initMissionsSystem();
        this.initCertificationsSystem();
        setInterval(() => this.updateTime(), 1000);
        setInterval(() => this.updateSouthPoleTemperature(), 300000); // 5 minutos
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        document.getElementById('current-time').textContent = timeString;
    }

    setupEventListeners() {
        // Login
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Registro
        document.getElementById('register-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSection('register-section');
        });

        document.getElementById('back-to-login').addEventListener('click', () => {
            this.showSection('login-section');
        });

        // Hamburger Menu
        document.getElementById('hamburger-menu').addEventListener('click', () => {
            this.toggleSidebar();
        });

        document.getElementById('close-sidebar').addEventListener('click', () => {
            this.closeSidebar();
        });

        // Sidebar Navigation
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = item.getAttribute('data-section');
                if (section) {
                    this.showSidebarSection(section);
                } else if (item.id === 'logout-sidebar') {
                    this.logout();
                } else if (item.id === 'main-view-sidebar') {
                    this.showMainView();
                }
            });
        });

        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Dashboard navigation
        document.querySelectorAll('.nav-item[data-section]').forEach(item => {
            item.addEventListener('click', () => {
                this.showDashboardSection(item.dataset.section);
            });
        });

        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Document creation
        document.getElementById('create-doc-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createDocument();
        });

        document.getElementById('clear-form').addEventListener('click', () => {
            document.getElementById('create-doc-form').reset();
        });

        // Filters
        document.getElementById('level-filter').addEventListener('change', () => {
            this.filterDocuments();
        });

        document.getElementById('search-docs').addEventListener('input', () => {
            this.filterDocuments();
        });

        // User tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchUserTab(tab.dataset.tab);
            });
        });

        // Modal
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });

        // Password validation
        document.getElementById('register-password').addEventListener('input', () => {
            this.validatePassword();
        });

        // Sistema de Segurança
        document.getElementById('unlock-system')?.addEventListener('click', () => {
            this.unlockSite();
        });

        document.getElementById('emergency-logout')?.addEventListener('click', () => {
            this.logout();
        });

        // Status da Área PT9 - será configurado após o dashboard ser carregado
        // O event listener será adicionado no showDashboard()
    }

    handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Verificar usuários aprovados
        let user = this.users.find(u => u.email === email && u.password === password && u.isApproved);
        
        if (!user) {
            // Verificar usuários pendentes
            user = this.pendingUsers.find(u => u.email === email && u.password === password);
            if (user) {
                this.showNotification('Conta pendente de aprovação. Aguarde a aprovação de um administrador.', 'warning');
                return;
            }
        }

        if (user) {
            this.currentUser = user;
            user.lastLogin = new Date();
            this.saveToStorage('users', this.users);
            
            // Log de segurança
            this.logSecurityEvent(`Login realizado: ${user.email} (Nível ${user.accessLevel}, Gerência ${user.managementLevel})`);
            
            // Verificar se é Gerência 4 (God Mode)
            if (user.managementLevel === 4) {
                this.showNotification(`🔴 GOD MODE ATIVADO - Bem-vindo, ${user.name}! Acesso total ao sistema concedido.`, 'success');
                this.activateGodMode();
            } else {
                this.showNotification(`Bem-vindo, ${user.name}!`, 'success');
            }
            
            this.showDashboard();
            this.updateUserLevel();
        } else {
            this.showNotification('Email ou senha incorretos.', 'error');
        }
    }

    handleRegister() {
        const formData = new FormData(document.getElementById('register-form'));
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (!this.validatePassword(password)) {
            this.showNotification('Senha deve conter pelo menos 2 letras e 4 números.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showNotification('Senhas não coincidem.', 'error');
            return;
        }

        const newUser = {
            email: formData.get('email'),
            password: password,
            name: formData.get('employeeName'),
            department: formData.get('department'),
            birthDate: formData.get('birthDate'),
            accessLevel: parseInt(formData.get('accessLevel')),
            photo: formData.get('employeePhoto'),
            isApproved: false,
            isAdmin: false,
            managementLevel: 0,
            registrationDate: new Date().toISOString()
        };

        // Verificar se email já existe
        if (this.users.find(u => u.email === newUser.email) || 
            this.pendingUsers.find(u => u.email === newUser.email)) {
            this.showNotification('Email já cadastrado no sistema.', 'error');
            return;
        }

        this.pendingUsers.push(newUser);
        this.saveToStorage('pendingUsers', this.pendingUsers);
        
        document.getElementById('register-form').reset();
        this.showSection('login-section');
        this.showNotification('Registro enviado com sucesso! Aguarde a aprovação de um administrador.', 'success');
    }

    validatePassword(password) {
        const letters = password.match(/[a-zA-Z]/g) || [];
        const numbers = password.match(/[0-9]/g) || [];
        return letters.length >= 2 && numbers.length >= 4;
    }

    showDashboard() {
        this.showSection('dashboard-section');
        this.loadDocuments();
        this.loadUsers();
        this.updateStats();
        this.updateNavigation();
        this.setupRichEditor();
        this.setupAIAssistant();
        this.setupReports();
        this.setupAnnouncements();
        this.setupComplaints();
        this.setupMissions();
        this.setupSCPs();
        this.setupCertifications();
        this.loadReports();
        this.loadAnnouncements();
        this.loadComplaints();
        this.loadMissions();
        this.loadSCPs();
        this.loadCertifications();
        this.loadNotifications();
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('active');
    }

    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.remove('active');
    }

    showSidebarSection(sectionId) {
        // Hide main view
        const mainView = document.getElementById('main-view');
        if (mainView) {
            mainView.classList.remove('active');
        }
        
        // Show sidebar content
        const sidebarContent = document.querySelector('.sidebar-content');
        if (sidebarContent) {
            sidebarContent.classList.add('active');
        }
        
        // Hide all dashboard sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update sidebar active state
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
        
        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            this.closeSidebar();
        }
    }

    showMainView() {
        // Hide sidebar content
        const sidebarContent = document.querySelector('.sidebar-content');
        if (sidebarContent) {
            sidebarContent.classList.remove('active');
        }
        
        // Show main view
        const mainView = document.getElementById('main-view');
        if (mainView) {
            mainView.classList.add('active');
        }
        
        // Remove active state from sidebar items
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
    }

    loadNotifications() {
        const container = document.getElementById('notifications-container');
        container.innerHTML = '';
        
        // Get notifications based on user's department and management level
        const notifications = [];
        
        // Add announcements
        this.announcements.forEach(announcement => {
            notifications.push({
                type: 'announcement',
                title: announcement.title,
                content: announcement.content,
                priority: announcement.priority,
                time: announcement.timestamp,
                from: announcement.from
            });
        });
        
        // Add reports for this user's department
        this.reports.forEach(report => {
            if (report.targetDepartment === this.currentUser.department || 
                this.currentUser.managementLevel >= 1) {
                notifications.push({
                    type: 'report',
                    title: `Relatório: ${report.title}`,
                    content: `De: ${report.from} - ${report.content.substring(0, 100)}...`,
                    urgency: report.urgency,
                    time: report.timestamp,
                    from: report.from
                });
            }
        });
        
        // Sort by time (newest first)
        notifications.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        // Display notifications
        notifications.forEach(notification => {
            const notificationElement = document.createElement('div');
            notificationElement.className = 'notification-item';
            
            const priorityClass = notification.priority || notification.urgency || 'normal';
            
            notificationElement.innerHTML = `
                <div class="notification-header">
                    <span class="notification-title">${notification.title}</span>
                    <span class="notification-time">${new Date(notification.time).toLocaleString('pt-BR')}</span>
                </div>
                <div class="notification-content">
                    ${notification.content}
                </div>
                <div class="notification-meta">
                    <span class="notification-from">De: ${notification.from}</span>
                    <span class="notification-type ${priorityClass}">${notification.type === 'announcement' ? 'Anúncio' : 'Relatório'}</span>
                </div>
            `;
            
            container.appendChild(notificationElement);
        });
        
        if (notifications.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Nenhuma notificação no momento.</p>';
        }
    }

    showSection(sectionId) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
    }

    showDashboardSection(sectionId) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
    }

    updateNavigation() {
        // Update sidebar navigation visibility
        const usersSidebar = document.getElementById('users-sidebar');
        const reportsSidebar = document.getElementById('reports-sidebar');
        const announcementsSidebar = document.getElementById('announcements-sidebar');
        const complaintsSidebar = document.getElementById('complaints-sidebar');
        const adminSidebar = document.getElementById('admin-sidebar');

        // Show users management for management level 1+
        if (this.currentUser.managementLevel >= 1) {
            usersSidebar.style.display = 'flex';
        }

        // Show reports for all users
        reportsSidebar.style.display = 'flex';

        // Show announcements for Admin department or management level 3
        if (this.currentUser.department === 'Departamento Administrativo' || this.currentUser.managementLevel >= 3) {
            announcementsSidebar.style.display = 'flex';
        }

        // Show complaints for Classe-D, RH, or management level 3
        if (this.currentUser.department === 'Classe-D' || 
            this.currentUser.department === 'Recursos Humanos' || 
            this.currentUser.managementLevel >= 3) {
            complaintsSidebar.style.display = 'flex';
        }

        // Show admin panel for management level 2+
        if (this.currentUser.managementLevel >= 2) {
            adminSidebar.style.display = 'flex';
        }
    }

    updateUserLevel() {
        const levelElement = document.getElementById('user-level');
        levelElement.textContent = `NÍVEL: ${this.currentUser.accessLevel}`;
    }

    createDocument() {
        const formData = new FormData(document.getElementById('create-doc-form'));
        const level = parseInt(formData.get('level'));

        if (level > this.currentUser.accessLevel) {
            this.showNotification('Você não tem permissão para criar documentações deste nível.', 'error');
            return;
        }

        const document = {
            id: Date.now(),
            title: formData.get('title'),
            content: formData.get('content'),
            category: formData.get('category'),
            level: level,
            author: this.currentUser.name,
            authorEmail: this.currentUser.email,
            createdAt: new Date().toISOString(),
            isApproved: this.currentUser.managementLevel >= 1
        };

        this.documents.push(document);
        this.saveToStorage('documents', this.documents);
        
        document.getElementById('create-doc-form').reset();
        this.showNotification('Documentação criada com sucesso!', 'success');
        this.loadDocuments();
    }

    loadDocuments() {
        const documentsList = document.getElementById('documents-list');
        const userLevel = this.currentUser.accessLevel;
        
        const accessibleDocs = this.documents.filter(doc => 
            doc.level <= userLevel && (doc.isApproved || doc.authorEmail === this.currentUser.email)
        );

        documentsList.innerHTML = accessibleDocs.map(doc => `
            <div class="doc-card" onclick="scpSystem.openDocument(${doc.id})">
                <div class="doc-meta">
                    <span class="doc-level">Nível ${doc.level}</span>
                    <span>${doc.category}</span>
                </div>
                <h3>${doc.title}</h3>
                <div class="doc-preview">${doc.content.substring(0, 150)}...</div>
                <div class="doc-meta">
                    <span>Por: ${doc.author}</span>
                    <span>${new Date(doc.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
            </div>
        `).join('');
    }

    filterDocuments() {
        const levelFilter = document.getElementById('level-filter').value;
        const searchTerm = document.getElementById('search-docs').value.toLowerCase();
        const userLevel = this.currentUser.accessLevel;
        
        const accessibleDocs = this.documents.filter(doc => 
            doc.level <= userLevel && (doc.isApproved || doc.authorEmail === this.currentUser.email)
        );

        const filteredDocs = accessibleDocs.filter(doc => {
            const matchesLevel = !levelFilter || doc.level.toString() === levelFilter;
            const matchesSearch = doc.title.toLowerCase().includes(searchTerm) || 
                                doc.content.toLowerCase().includes(searchTerm) ||
                                doc.category.toLowerCase().includes(searchTerm);
            return matchesLevel && matchesSearch;
        });

        const documentsList = document.getElementById('documents-list');
        documentsList.innerHTML = filteredDocs.map(doc => `
            <div class="doc-card" onclick="scpSystem.openDocument(${doc.id})">
                <div class="doc-meta">
                    <span class="doc-level">Nível ${doc.level}</span>
                    <span>${doc.category}</span>
                </div>
                <h3>${doc.title}</h3>
                <div class="doc-preview">${doc.content.substring(0, 150)}...</div>
                <div class="doc-meta">
                    <span>Por: ${doc.author}</span>
                    <span>${new Date(doc.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
            </div>
        `).join('');
    }

    openDocument(docId) {
        const doc = this.documents.find(d => d.id === docId);
        if (!doc) return;

        document.getElementById('modal-title').textContent = doc.title;
        document.getElementById('modal-content').innerHTML = `
            <div class="doc-meta">
                <span class="doc-level">Nível ${doc.level}</span>
                <span>${doc.category}</span>
                <span>Por: ${doc.author}</span>
                <span>${new Date(doc.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <div class="doc-content">
                ${doc.content.replace(/\n/g, '<br>')}
            </div>
        `;

        document.getElementById('doc-modal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('doc-modal').style.display = 'none';
    }

    loadUsers() {
        const pendingUsersContainer = document.getElementById('pending-users');
        const approvedUsersContainer = document.getElementById('approved-users');

        // Usuários pendentes
        pendingUsersContainer.innerHTML = this.pendingUsers.map(user => `
            <div class="user-card">
                <div class="user-info">
                    <h4>${user.name}</h4>
                    <p>${user.email} - ${user.department}</p>
                    <p>Nível solicitado: ${user.accessLevel}</p>
                </div>
                <div class="user-actions">
                    <button onclick="scpSystem.approveUser('${user.email}')" class="btn-primary">Aprovar</button>
                    <button onclick="scpSystem.rejectUser('${user.email}')" class="btn-secondary">Rejeitar</button>
                </div>
            </div>
        `).join('');

        // Usuários aprovados
        approvedUsersContainer.innerHTML = this.users.map(user => `
            <div class="user-card">
                <div class="user-info">
                    <h4>${user.name}</h4>
                    <p>${user.email} - ${user.department}</p>
                    <p>Nível: ${user.accessLevel} ${user.managementLevel > 0 ? `(Gerência: ${user.managementLevel})` : ''}</p>
                </div>
                ${this.currentUser.managementLevel >= 2 ? `
                    <div class="user-actions">
                        <button onclick="scpSystem.changeUserLevel('${user.email}')" class="btn-secondary">Alterar Nível</button>
                        <button onclick="scpSystem.removeUser('${user.email}')" class="btn-secondary">Remover</button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    switchUserTab(tabName) {
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-users`).classList.add('active');
    }

    approveUser(email) {
        const userIndex = this.pendingUsers.findIndex(u => u.email === email);
        if (userIndex === -1) return;

        const user = this.pendingUsers.splice(userIndex, 1)[0];
        user.isApproved = true;
        this.users.push(user);

        this.saveToStorage('pendingUsers', this.pendingUsers);
        this.saveToStorage('users', this.users);
        
        this.loadUsers();
        this.updateStats();
        this.showNotification('Usuário aprovado com sucesso!', 'success');
    }

    rejectUser(email) {
        const userIndex = this.pendingUsers.findIndex(u => u.email === email);
        if (userIndex === -1) return;

        this.pendingUsers.splice(userIndex, 1);
        this.saveToStorage('pendingUsers', this.pendingUsers);
        
        this.loadUsers();
        this.updateStats();
        this.showNotification('Usuário rejeitado.', 'warning');
    }

    changeUserLevel(email) {
        const user = this.users.find(u => u.email === email);
        if (!user) return;

        // Verificar se pode definir Access Level 6
        const maxLevel = this.canSetAccessLevel6() ? 6 : 5;
        const levelRange = this.canSetAccessLevel6() ? '1-6' : '1-5';
        
        const newLevel = prompt(`Novo nível de acesso para ${user.name} (${levelRange}):`);
        if (newLevel && !isNaN(newLevel) && newLevel >= 1 && newLevel <= maxLevel) {
            user.accessLevel = parseInt(newLevel);
            this.saveToStorage('users', this.users);
            this.loadUsers();
            this.showNotification('Nível de acesso alterado com sucesso!', 'success');
        } else if (newLevel) {
            this.showNotification('Nível de acesso inválido!', 'error');
        }
    }

    removeUser(email) {
        if (email === this.currentUser.email) {
            this.showNotification('Você não pode remover sua própria conta.', 'error');
            return;
        }

        const targetUser = this.users.find(u => u.email === email);
        if (!targetUser) return;

        // Verificar permissões para remover usuários
        if (targetUser.managementLevel >= this.currentUser.managementLevel && this.currentUser.managementLevel < 4) {
            this.showNotification('Você não tem permissão para remover este usuário.', 'error');
            return;
        }

        if (confirm('Tem certeza que deseja remover este usuário?')) {
            const userIndex = this.users.findIndex(u => u.email === email);
            if (userIndex !== -1) {
                this.users.splice(userIndex, 1);
                this.saveToStorage('users', this.users);
                this.loadUsers();
                this.updateStats();
                this.logSecurityEvent(`Usuário ${email} removido por ${this.currentUser.email}`);
                this.showNotification('Usuário removido com sucesso!', 'success');
            }
        }
    }

    updateStats() {
        document.getElementById('total-users').textContent = this.users.length;
        document.getElementById('total-docs').textContent = this.documents.length;
        document.getElementById('pending-approvals').textContent = this.pendingUsers.length;
    }

    logout() {
        this.currentUser = null;
        this.showSection('login-section');
        document.getElementById('user-level').textContent = 'NÍVEL: --';
        this.showNotification('Logout realizado com sucesso.', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    loadSampleData() {
        if (this.documents.length === 0) {
            const sampleDocs = [
                {
                    id: 1,
                    title: 'SCP-001 - A Porta',
                    content: 'SCP-001 é uma anomalia que se manifesta como uma porta de madeira que aparece em locais aleatórios. A porta não pode ser aberta por meios convencionais e qualquer tentativa de forçá-la resulta em consequências severas para o indivíduo.',
                    category: 'SCP',
                    level: 1,
                    author: 'Dr. Smith',
                    authorEmail: 'dr.smith@area-pt9.scp',
                    createdAt: new Date().toISOString(),
                    isApproved: true
                },
                {
                    id: 2,
                    title: 'Protocolo de Contenção - SCP-001',
                    content: 'Para conter SCP-001, é necessário manter uma distância mínima de 50 metros da anomalia. Qualquer pessoa que se aproxime deve ser imediatamente evacuada e submetida a exames médicos.',
                    category: 'Protocolo',
                    level: 2,
                    author: 'Dr. Johnson',
                    authorEmail: 'dr.johnson@area-pt9.scp',
                    createdAt: new Date().toISOString(),
                    isApproved: true
                },
                {
                    id: 3,
                    title: 'Relatório de Incidente - 15/03/2024',
                    content: 'Durante a manutenção de rotina, um membro da equipe de segurança tentou forçar a abertura de SCP-001. O indivíduo foi encontrado inconsciente a 100 metros de distância, sem ferimentos aparentes.',
                    category: 'Incidente',
                    level: 3,
                    author: 'Agente Silva',
                    authorEmail: 'agente.silva@area-pt9.scp',
                    createdAt: new Date().toISOString(),
                    isApproved: true
                }
            ];
            
            this.documents = sampleDocs;
            this.saveToStorage('documents', this.documents);
        }
    }

    loadFromStorage(key) {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch (e) {
            return null;
        }
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error('Erro ao salvar dados:', e);
        }
    }

    // Novas funcionalidades
    setupRichEditor() {
        const toolbar = document.querySelector('.rich-editor-toolbar');
        const editor = document.getElementById('doc-content');

        if (!toolbar || !editor) return;

        toolbar.addEventListener('click', (e) => {
            if (e.target.classList.contains('toolbar-btn')) {
                e.preventDefault();
                const command = e.target.dataset.command;
                
                if (command === 'insertUnorderedList') {
                    document.execCommand('insertUnorderedList', false, null);
                } else if (command === 'insertOrderedList') {
                    document.execCommand('insertOrderedList', false, null);
                } else {
                    document.execCommand(command, false, null);
                }
                
                editor.focus();
            }
        });
    }

    setupAIAssistant() {
        const aiButton = document.getElementById('ai-assist');
        const aiModal = document.getElementById('ai-modal');
        const analyzeButton = document.getElementById('ai-analyze');
        const applyButton = document.getElementById('ai-apply');
        const aiText = document.getElementById('ai-text');
        const aiResult = document.getElementById('ai-result');
        const editor = document.getElementById('doc-content');

        if (aiButton) {
            aiButton.addEventListener('click', () => {
                aiModal.style.display = 'block';
                aiText.value = editor.innerText;
            });
        }

        if (analyzeButton) {
            analyzeButton.addEventListener('click', () => {
                const text = aiText.value;
                if (text.trim()) {
                    const improvedText = this.improveText(text);
                    aiResult.innerHTML = improvedText;
                    applyButton.style.display = 'block';
                }
            });
        }

        if (applyButton) {
            applyButton.addEventListener('click', () => {
                editor.innerHTML = aiResult.innerHTML;
                aiModal.style.display = 'none';
                this.showNotification('Texto melhorado aplicado com sucesso!', 'success');
            });
        }

        // Fechar modal
        const closeButtons = aiModal.querySelectorAll('.close');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                aiModal.style.display = 'none';
            });
        });
    }

    improveText(text) {
        // Simulação de IA para melhorar o texto
        let improved = text;
        
        // Corrigir pontuação
        improved = improved.replace(/\s+([.,!?])/g, '$1');
        improved = improved.replace(/([.,!?])([A-Za-z])/g, '$1 $2');
        
        // Melhorar formatação
        improved = improved.replace(/\n{3,}/g, '\n\n');
        
        // Adicionar parágrafos
        improved = improved.split('\n\n').map(paragraph => {
            if (paragraph.trim()) {
                return `<p>${paragraph.trim()}</p>`;
            }
            return '';
        }).join('');
        
        return improved;
    }

    setupReports() {
        const sendReportForm = document.getElementById('send-report-form');
        if (sendReportForm) {
            sendReportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendReport();
            });
        }
    }

    sendReport() {
        const formData = new FormData(document.getElementById('send-report-form'));
        
        const report = {
            id: Date.now(),
            title: formData.get('title'),
            content: formData.get('content'),
            targetDepartment: formData.get('targetDepartment'),
            accessLevel: parseInt(formData.get('accessLevel')),
            urgency: formData.get('urgency'),
            sender: this.currentUser.name,
            senderEmail: this.currentUser.email,
            senderDepartment: this.currentUser.department,
            createdAt: new Date().toISOString(),
            isRead: false
        };

        this.reports.push(report);
        this.saveToStorage('reports', this.reports);
        
        document.getElementById('send-report-form').reset();
        this.showNotification('Relatório enviado com sucesso!', 'success');
        this.loadReports();
    }

    loadReports() {
        const reportsList = document.getElementById('received-reports-list');
        if (!reportsList) return;

        const userDepartment = this.currentUser.department;
        const userLevel = this.currentUser.accessLevel;
        
        const receivedReports = this.reports.filter(report => 
            report.targetDepartment === userDepartment && 
            report.accessLevel <= userLevel
        );

        reportsList.innerHTML = receivedReports.map(report => `
            <div class="report-item ${report.isRead ? 'read' : 'unread'}">
                <h4>${report.title}</h4>
                <div class="report-meta">
                    <span>De: ${report.sender} (${report.senderDepartment})</span>
                    <span class="report-urgency ${report.urgency}">${report.urgency.toUpperCase()}</span>
                </div>
                <p>${report.content.substring(0, 150)}...</p>
                <div class="report-meta">
                    <span>${new Date(report.createdAt).toLocaleDateString('pt-BR')}</span>
                    <button onclick="scpSystem.readReport(${report.id})" class="btn-secondary">Ler Completo</button>
                </div>
            </div>
        `).join('');
    }

    readReport(reportId) {
        const report = this.reports.find(r => r.id === reportId);
        if (report) {
            report.isRead = true;
            this.saveToStorage('reports', this.reports);
            
            // Mostrar relatório completo em modal
            document.getElementById('modal-title').textContent = report.title;
            document.getElementById('modal-content').innerHTML = `
                <div class="report-meta">
                    <span>De: ${report.sender} (${report.senderDepartment})</span>
                    <span class="report-urgency ${report.urgency}">${report.urgency.toUpperCase()}</span>
                    <span>${new Date(report.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                <div class="report-content">
                    ${report.content.replace(/\n/g, '<br>')}
                </div>
            `;
            
            document.getElementById('doc-modal').style.display = 'block';
        }
    }

    setupAnnouncements() {
        const createAnnouncementForm = document.getElementById('create-announcement-form');
        if (createAnnouncementForm) {
            createAnnouncementForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createAnnouncement();
            });
        }
    }

    createAnnouncement() {
        const formData = new FormData(document.getElementById('create-announcement-form'));
        
        const announcement = {
            id: Date.now(),
            title: formData.get('title'),
            content: formData.get('content'),
            priority: formData.get('priority'),
            author: this.currentUser.name,
            authorEmail: this.currentUser.email,
            createdAt: new Date().toISOString()
        };

        this.announcements.push(announcement);
        this.saveToStorage('announcements', this.announcements);
        
        document.getElementById('create-announcement-form').reset();
        this.showNotification('Anúncio publicado com sucesso!', 'success');
        this.loadAnnouncements();
    }

    loadAnnouncements() {
        const announcementsList = document.getElementById('announcements-list');
        if (!announcementsList) return;

        announcementsList.innerHTML = this.announcements.map(announcement => `
            <div class="announcement-item">
                <h4>${announcement.title}</h4>
                <span class="announcement-priority ${announcement.priority}">${announcement.priority.toUpperCase()}</span>
                <p>${announcement.content.substring(0, 150)}...</p>
                <div class="announcement-meta">
                    <span>Por: ${announcement.author}</span>
                    <span>${new Date(announcement.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
            </div>
        `).join('');
    }

    setupComplaints() {
        const createComplaintForm = document.getElementById('create-complaint-form');
        if (createComplaintForm) {
            createComplaintForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createComplaint();
            });
        }
    }

    createComplaint() {
        const formData = new FormData(document.getElementById('create-complaint-form'));
        
        const complaint = {
            id: Date.now(),
            subject: formData.get('subject'),
            type: formData.get('type'),
            content: formData.get('content'),
            author: this.currentUser.name,
            authorEmail: this.currentUser.email,
            authorDepartment: this.currentUser.department,
            createdAt: new Date().toISOString(),
            status: 'pendente'
        };

        this.complaints.push(complaint);
        this.saveToStorage('complaints', this.complaints);
        
        document.getElementById('create-complaint-form').reset();
        this.showNotification('Reclamação enviada com sucesso!', 'success');
        this.loadComplaints();
    }

    loadComplaints() {
        const complaintsList = document.getElementById('my-complaints-list');
        if (!complaintsList) return;

        const userComplaints = this.complaints.filter(complaint => 
            complaint.authorEmail === this.currentUser.email
        );

        complaintsList.innerHTML = userComplaints.map(complaint => `
            <div class="complaint-item">
                <h4>${complaint.subject}</h4>
                <span class="complaint-type">${complaint.type}</span>
                <p>${complaint.content.substring(0, 150)}...</p>
                <div class="complaint-meta">
                    <span>Status: ${complaint.status}</span>
                    <span>${new Date(complaint.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
            </div>
        `).join('');
    }

    updateNavigation() {
        // Update sidebar navigation visibility
        const usersSidebar = document.getElementById('users-sidebar');
        const reportsSidebar = document.getElementById('reports-sidebar');
        const announcementsSidebar = document.getElementById('announcements-sidebar');
        const complaintsSidebar = document.getElementById('complaints-sidebar');
        const adminSidebar = document.getElementById('admin-sidebar');

        // Management Level 4 tem acesso total
        if (this.currentUser.managementLevel >= 4) {
            if (usersSidebar) usersSidebar.style.display = 'flex';
            if (reportsSidebar) reportsSidebar.style.display = 'flex';
            if (announcementsSidebar) announcementsSidebar.style.display = 'flex';
            if (complaintsSidebar) complaintsSidebar.style.display = 'flex';
            if (adminSidebar) adminSidebar.style.display = 'flex';
            return;
        }

        // Show users management for management level 1+
        if (this.currentUser.managementLevel >= 1) {
            if (usersSidebar) usersSidebar.style.display = 'flex';
        }

        // Show reports for all users
        if (reportsSidebar) reportsSidebar.style.display = 'flex';

        // Show announcements for Admin department or management level 3
        if (this.currentUser.department === 'Departamento Administrativo' || this.currentUser.managementLevel >= 3) {
            if (announcementsSidebar) announcementsSidebar.style.display = 'flex';
        }

        // Show complaints for Classe-D, RH, or management level 3
        if (this.currentUser.department === 'Classe-D' || 
            this.currentUser.department === 'Recursos Humanos' || 
            this.currentUser.managementLevel >= 3) {
            if (complaintsSidebar) complaintsSidebar.style.display = 'flex';
        }

        // Show admin panel for management level 2+
        if (this.currentUser.managementLevel >= 2) {
            if (adminSidebar) adminSidebar.style.display = 'flex';
        }
    }

    loadUsers() {
        const pendingUsersContainer = document.getElementById('pending-users');
        const approvedUsersContainer = document.getElementById('approved-users');
        const complaintsUsersContainer = document.getElementById('complaints-users');

        // Usuários pendentes
        if (pendingUsersContainer) {
            pendingUsersContainer.innerHTML = this.pendingUsers.map(user => `
                <div class="user-card">
                    <div class="user-info">
                        <h4>${user.name}</h4>
                        <p>${user.email} - ${user.department}</p>
                        <p>Cargo: ${user.position || 'N/A'}</p>
                        <p>Nível solicitado: ${user.accessLevel}</p>
                    </div>
                    <div class="user-actions">
                        <button onclick="scpSystem.approveUser('${user.email}')" class="btn-primary">Aprovar</button>
                        <button onclick="scpSystem.rejectUser('${user.email}')" class="btn-secondary">Rejeitar</button>
                    </div>
                </div>
            `).join('');
        }

        // Usuários aprovados
        if (approvedUsersContainer) {
            approvedUsersContainer.innerHTML = this.users.map(user => `
                <div class="user-card">
                    <div class="user-info">
                        <h4>${user.name}</h4>
                        <p>${user.email} - ${user.department}</p>
                        <p>Cargo: ${user.position || 'N/A'}</p>
                        <p>Nível: ${this.canViewAccessLevel6() ? user.accessLevel : (user.accessLevel === 6 ? 'N/A' : user.accessLevel)} ${user.managementLevel > 0 ? `(Gerência: ${user.managementLevel})` : ''}</p>
                    </div>
                    ${this.currentUser.managementLevel >= 2 ? `
                        <div class="user-actions">
                            <button onclick="scpSystem.changeUserLevel('${user.email}')" class="btn-secondary">Alterar Nível</button>
                            <button onclick="scpSystem.removeUser('${user.email}')" class="btn-secondary">Remover</button>
                        </div>
                    ` : ''}
                </div>
            `).join('');
        }

        // Reclamações (apenas para Comitê de Ética e Nível 3)
        if (complaintsUsersContainer && (this.currentUser.department === 'Comitê de Ética' || this.currentUser.managementLevel >= 3)) {
            complaintsUsersContainer.innerHTML = this.complaints.map(complaint => `
                <div class="complaint-item">
                    <h4>${complaint.subject}</h4>
                    <span class="complaint-type">${complaint.type}</span>
                    <p>De: ${complaint.author} (${complaint.authorDepartment})</p>
                    <p>${complaint.content.substring(0, 150)}...</p>
                    <div class="complaint-meta">
                        <span>Status: ${complaint.status}</span>
                        <span>${new Date(complaint.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    approveUser(email) {
        const userIndex = this.pendingUsers.findIndex(u => u.email === email);
        if (userIndex === -1) return;

        const user = this.pendingUsers.splice(userIndex, 1)[0];
        user.isApproved = true;
        
        // Classe-D recebe nível 0
        if (user.department === 'Classe-D') {
            user.accessLevel = 0;
        }
        
        this.users.push(user);

        this.saveToStorage('pendingUsers', this.pendingUsers);
        this.saveToStorage('users', this.users);
        
        this.loadUsers();
        this.updateStats();
        this.showNotification('Usuário aprovado com sucesso!', 'success');
    }

    updateStats() {
        document.getElementById('total-users').textContent = this.users.length;
        document.getElementById('total-docs').textContent = this.documents.length;
        document.getElementById('pending-approvals').textContent = this.pendingUsers.length;
        document.getElementById('total-reports').textContent = this.reports.length;
        document.getElementById('total-missions').textContent = this.missions.length;
        document.getElementById('total-scps').textContent = this.scps.length;
    }

    showDashboard() {
        // Verificar se o sistema está bloqueado
        if (this.securitySystem.isLocked) {
            this.showSection('lockdown-section');
            // Mostrar botão de desbloqueio apenas para Management Level 4
            const unlockBtn = document.getElementById('unlock-system');
            if (unlockBtn && this.currentUser.managementLevel >= 4) {
                unlockBtn.style.display = 'block';
            }
            return;
        }

        this.showSection('dashboard-section');
        
        // Garantir que a main view esteja ativa por padrão
        this.showMainView();
        
        this.loadDocuments();
        this.loadUsers();
        this.loadReports();
        this.loadAnnouncements();
        this.loadComplaints();
        this.updateStats();
        this.updateNavigation();
        this.setupRichEditor();
        this.setupAIAssistant();
        this.setupReports();
        this.setupAnnouncements();
        this.setupComplaints();
        this.loadNotifications();
        this.loadMainAnnouncements();
        
        // Mostrar botão de alterar status apenas para Departamento Administrativo
        const changeStatusBtn = document.getElementById('change-status');
        if (changeStatusBtn) {
            if (this.currentUser.department === 'Departamento Administrativo' || this.currentUser.managementLevel >= 1) {
                changeStatusBtn.style.display = 'block';
                // Adicionar event listener para o botão de alterar status
                changeStatusBtn.onclick = () => {
                    this.showStatusChangeModal();
                };
            } else {
                changeStatusBtn.style.display = 'none';
            }
        }
    }

    // Sistema de Segurança
    initSecuritySystem() {
        this.securitySystem = this.loadFromStorage('securitySystem') || this.securitySystem;
        this.saveToStorage('securitySystem', this.securitySystem);
    }

    updateSecurityThreatLevel(level) {
        this.securitySystem.threatLevel = level;
        this.securitySystem.lastScan = new Date();
        this.saveToStorage('securitySystem', this.securitySystem);
        
        if (level >= 5) {
            this.lockSite();
        }
    }

    lockSite() {
        this.securitySystem.isLocked = true;
        this.saveToStorage('securitySystem', this.securitySystem);
        this.showNotification('SISTEMA BLOQUEADO - AMEAÇA DETECTADA', 'error');
        
        // Redirecionar para tela de bloqueio
        this.showSection('lockdown-section');
    }

    unlockSite() {
        this.securitySystem.isLocked = false;
        this.securitySystem.threatLevel = 0;
        this.saveToStorage('securitySystem', this.securitySystem);
        this.showNotification('Sistema desbloqueado com sucesso', 'success');
        this.showDashboard();
    }

    logSecurityEvent(event) {
        this.securitySystem.securityLog.push({
            timestamp: new Date(),
            event: event,
            user: this.currentUser ? this.currentUser.email : 'Sistema'
        });
        this.saveToStorage('securitySystem', this.securitySystem);
    }

    // Status da Área PT9
    updateSiteStatus() {
        const statusElement = document.getElementById('site-status');
        if (statusElement) {
            statusElement.textContent = this.siteStatus.status;
        }
    }

    changeSiteStatus(newStatus) {
        if (this.currentUser.department === 'Departamento Administrativo' || this.currentUser.managementLevel >= 1) {
            this.siteStatus.status = newStatus;
            this.siteStatus.lastUpdate = new Date();
            this.siteStatus.updatedBy = this.currentUser.name;
            this.saveToStorage('siteStatus', this.siteStatus);
            this.updateSiteStatus();
            this.showNotification('Status da Área PT9 atualizado', 'success');
        }
    }

    // Temperatura do Polo Sul
    updateSouthPoleTemperature() {
        // Simulação da temperatura do Polo Sul (varia entre -40°C e -80°C)
        const baseTemp = -60;
        const variation = Math.random() * 40 - 20;
        const temperature = (baseTemp + variation).toFixed(1);
        
        const tempElement = document.getElementById('south-pole-temp');
        if (tempElement) {
            tempElement.textContent = `${temperature}°C`;
        }
    }

    // Verificar se usuário pode ver Access Level 6
    canViewAccessLevel6() {
        return this.currentUser && this.currentUser.managementLevel >= 4;
    }

    // Verificar se usuário pode definir Access Level 6
    canSetAccessLevel6() {
        return this.currentUser && this.currentUser.managementLevel >= 4;
    }

    // Modal para alterar status
    showStatusChangeModal() {
        const statuses = ['OPERACIONAL', 'MANUTENÇÃO', 'EMERGÊNCIA', 'BLOQUEADO'];
        const statusOptions = statuses.map(status => 
            `<option value="${status}">${status}</option>`
        ).join('');

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-edit"></i> Alterar Status da Área PT9</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="input-group">
                        <label for="new-status">Novo Status:</label>
                        <select id="new-status">
                            ${statusOptions}
                        </select>
                    </div>
                    <div class="form-actions">
                        <button id="confirm-status-change" class="btn-primary">
                            <i class="fas fa-save"></i> Confirmar
                        </button>
                        <button id="cancel-status-change" class="btn-secondary">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';

        // Event listeners
        modal.querySelector('.close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('#cancel-status-change').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        modal.querySelector('#confirm-status-change').addEventListener('click', () => {
            const newStatus = document.getElementById('new-status').value;
            this.changeSiteStatus(newStatus);
            document.body.removeChild(modal);
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    // Carregar anúncios na página principal
    loadMainAnnouncements() {
        const container = document.getElementById('main-announcements');
        if (!container) return;

        const recentAnnouncements = this.announcements
            .filter(announcement => announcement.priority === 'urgente' || announcement.priority === 'importante')
            .slice(0, 5);

        if (recentAnnouncements.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhum anúncio importante no momento.</p>';
            return;
        }

        container.innerHTML = recentAnnouncements.map(announcement => `
            <div class="announcement-item">
                <div class="announcement-header">
                    <h4>${announcement.title}</h4>
                    <span class="announcement-priority ${announcement.priority}">${announcement.priority.toUpperCase()}</span>
                </div>
                <p>${announcement.content}</p>
                <small>Por: ${announcement.author} - ${new Date(announcement.createdAt).toLocaleDateString('pt-BR')}</small>
            </div>
        `).join('');
    }

    // Inicializar o banco de dados de SCPs
    initSCPDatabase() {
        if (this.scps.length === 0) {
            const sampleSCPs = [
                {
                    id: 1,
                    name: 'SCP-001 - A Porta',
                    description: 'SCP-001 é uma anomalia que se manifesta como uma porta de madeira que aparece em locais aleatórios. A porta não pode ser aberta por meios convencionais e qualquer tentativa de forçá-la resulta em consequências severas para o indivíduo.',
                    containmentProcedure: 'Manter uma distância mínima de 50 metros da anomalia. Qualquer pessoa que se aproxime deve ser imediatamente evacuada e submetida a exames médicos.',
                    level: 1,
                    isActive: true,
                    lastSeen: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'SCP-002 - O Homem-Pássaro',
                    description: 'SCP-002 é uma anomalia que se manifesta como um homem com asas e capacidade de voo. O indivíduo é extremamente agressivo e resistente a drogas convencionais.',
                    containmentProcedure: 'Manter SCP-002 em uma cela de alta segurança com paredes de aço inoxidável. Fornecer alimentação via porta de entrada e saída.',
                    level: 2,
                    isActive: true,
                    lastSeen: new Date().toISOString()
                },
                {
                    id: 3,
                    name: 'SCP-003 - O Homem-Cobra',
                    description: 'SCP-003 é uma anomalia que se manifesta como um homem com a cabeça de uma cobra. O indivíduo é extremamente agressivo e tem a capacidade de rastejar.',
                    containmentProcedure: 'Manter SCP-003 em uma cela de alta segurança com paredes de aço inoxidável. Fornecer alimentação via porta de entrada e saída.',
                    level: 3,
                    isActive: true,
                    lastSeen: new Date().toISOString()
                }
            ];
            this.scps = sampleSCPs;
            this.saveToStorage('scps', this.scps);
        }
    }

    // Inicializar o sistema de missões
    initMissionsSystem() {
        if (this.missions.length === 0) {
            const sampleMissions = [
                {
                    id: 1,
                    title: 'Missão SCP-001: Investigação de Anomalia',
                    description: 'Investigar a fonte de SCP-001 e determinar sua natureza.',
                    status: 'Ativa',
                    assignedTo: 'Comitê de Ética',
                    priority: 'Alta',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    title: 'Missão SCP-002: Captura de SCP-002',
                    description: 'Capturar SCP-002 vivo para análise detalhada.',
                    status: 'Pendente',
                    assignedTo: 'Comitê de Ética',
                    priority: 'Urgente',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 3,
                    title: 'Missão SCP-003: Contenção de SCP-003',
                    description: 'Estabelecer e manter a contenção de SCP-003.',
                    status: 'Concluída',
                    assignedTo: 'Comitê de Ética',
                    priority: 'Média',
                    createdAt: new Date().toISOString()
                }
            ];
            this.missions = sampleMissions;
            this.saveToStorage('missions', this.missions);
        }
    }

    // Inicializar o sistema de certificações
    initCertificationsSystem() {
        if (this.certifications.length === 0) {
            const sampleCertifications = [
                {
                    id: 1,
                    name: 'Certificação de Contenção SCP-001',
                    description: 'Certificar que SCP-001 está corretamente contido.',
                    issuedBy: 'Comitê de Ética',
                    issuedTo: 'Departamento de Segurança',
                    issuedAt: new Date().toISOString(),
                    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 2,
                    name: 'Certificação de Contenção SCP-002',
                    description: 'Certificar que SCP-002 está corretamente contido.',
                    issuedBy: 'Comitê de Ética',
                    issuedTo: 'Departamento de Segurança',
                    issuedAt: new Date().toISOString(),
                    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 3,
                    name: 'Certificação de Contenção SCP-003',
                    description: 'Certificar que SCP-003 está corretamente contido.',
                    issuedBy: 'Comitê de Ética',
                    issuedTo: 'Departamento de Segurança',
                    issuedAt: new Date().toISOString(),
                    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                }
            ];
            this.certifications = sampleCertifications;
            this.saveToStorage('certifications', this.certifications);
        }
    }

    // Inicializar o sistema de incidentes
    initIncidentsSystem() {
        if (this.incidents.length === 0) {
            const sampleIncidents = [
                {
                    id: 1,
                    title: 'Incidente de Contaminação SCP-001',
                    description: 'Um membro da equipe de segurança tentou forçar a abertura de SCP-001, resultando em contaminação.',
                    severity: 'Alta',
                    status: 'Ativo',
                    assignedTo: 'Comitê de Ética',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    title: 'Incidente de Fugitivo SCP-002',
                    description: 'SCP-002 escapou de sua cela durante a manutenção.',
                    severity: 'Urgente',
                    status: 'Ativo',
                    assignedTo: 'Comitê de Ética',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 3,
                    title: 'Incidente de Falha de Contenção SCP-003',
                    description: 'A contenção de SCP-003 foi comprometida durante um ataque.',
                    severity: 'Média',
                    status: 'Ativo',
                    assignedTo: 'Comitê de Ética',
                    createdAt: new Date().toISOString()
                }
            ];
            this.incidents = sampleIncidents;
            this.saveToStorage('incidents', this.incidents);
        }
    }

    // ATIVAÇÃO DO GOD MODE - GERÊNCIA 4
    activateGodMode() {
        // Adicionar indicador visual de God Mode
        const godModeIndicator = document.createElement('div');
        godModeIndicator.id = 'god-mode-indicator';
        godModeIndicator.innerHTML = `
            <div class="god-mode-banner">
                <i class="fas fa-crown"></i>
                <span>GOD MODE ATIVO - NÍVEL DE ACESSO ABSOLUTO</span>
                <i class="fas fa-crown"></i>
            </div>
        `;
        document.body.appendChild(godModeIndicator);

        // Adicionar funcionalidades especiais do God Mode
        this.enableGodModeFeatures();
        
        // Log de ativação
        this.logSecurityEvent('GOD MODE ATIVADO - Acesso total concedido ao sistema');
    }

    // HABILITAR FUNCIONALIDADES DO GOD MODE
    enableGodModeFeatures() {
        // Adicionar botões especiais para God Mode
        const godModeControls = `
            <div class="god-mode-controls">
                <button onclick="scpSystem.emergencyLockdown()" class="god-btn emergency">
                    <i class="fas fa-radiation"></i> LOCKDOWN TOTAL
                </button>
                <button onclick="scpSystem.systemReset()" class="god-btn reset">
                    <i class="fas fa-redo"></i> RESET SISTEMA
                </button>
                <button onclick="scpSystem.overrideAllPermissions()" class="god-btn override">
                    <i class="fas fa-unlock"></i> OVERRIDE PERMISSÕES
                </button>
                <button onclick="scpSystem.accessHiddenFiles()" class="god-btn hidden">
                    <i class="fas fa-eye"></i> ARQUIVOS OCULTOS
                </button>
            </div>
        `;
        
        // Inserir controles no dashboard
        const dashboard = document.querySelector('.dashboard-content');
        if (dashboard) {
            const existingControls = dashboard.querySelector('.god-mode-controls');
            if (!existingControls) {
                dashboard.insertAdjacentHTML('afterbegin', godModeControls);
            }
        }
    }

    // FUNÇÕES ESPECIAIS DO GOD MODE
    emergencyLockdown() {
        if (confirm('🔴 ATENÇÃO: Você está prestes a ativar o LOCKDOWN TOTAL do sistema. Isso irá bloquear TODOS os usuários exceto Gerência 4. Continuar?')) {
            this.securitySystem.isLocked = true;
            this.securitySystem.threatLevel = 5;
            this.saveToStorage('securitySystem', this.securitySystem);
            this.logSecurityEvent('LOCKDOWN TOTAL ATIVADO - Sistema em estado de emergência');
            this.showNotification('🔴 LOCKDOWN TOTAL ATIVADO - Sistema em estado de emergência', 'error');
            this.updateSecurityThreatLevel(5);
        }
    }

    systemReset() {
        if (confirm('⚠️ ATENÇÃO: Você está prestes a RESETAR TODO O SISTEMA. Todos os dados serão perdidos exceto usuários administrativos. Continuar?')) {
            // Manter apenas usuários admin
            const adminUsers = this.users.filter(u => u.isAdmin);
            this.users = adminUsers;
            this.documents = [];
            this.pendingUsers = [];
            this.reports = [];
            this.announcements = [];
            this.complaints = [];
            this.missions = [];
            this.scps = [];
            this.certifications = [];
            this.incidents = [];
            
            // Salvar reset
            this.saveToStorage('users', this.users);
            this.saveToStorage('documents', this.documents);
            this.saveToStorage('pendingUsers', this.pendingUsers);
            this.saveToStorage('reports', this.reports);
            this.saveToStorage('announcements', this.announcements);
            this.saveToStorage('complaints', this.complaints);
            this.saveToStorage('missions', this.missions);
            this.saveToStorage('scps', this.scps);
            this.saveToStorage('certifications', this.certifications);
            this.saveToStorage('incidents', this.incidents);
            
            this.logSecurityEvent('SISTEMA RESETADO - Todos os dados foram apagados');
            this.showNotification('🔄 Sistema resetado com sucesso', 'success');
            location.reload();
        }
    }

    overrideAllPermissions() {
        this.showNotification('🔓 OVERRIDE ATIVADO - Todas as permissões foram ignoradas temporariamente', 'success');
        this.logSecurityEvent('OVERRIDE DE PERMISSÕES ATIVADO - Todas as restrições ignoradas');
    }

    accessHiddenFiles() {
        // Mostrar arquivos ocultos do sistema
        const hiddenFiles = [
            { name: 'SCP-000 - Arquivo Classificado', level: 'ULTRA SECRETO' },
            { name: 'Protocolo Omega - Contenção Total', level: 'NÍVEL 6' },
            { name: 'Relatório O5 - Diretrizes Secretas', level: 'NÍVEL 6' },
            { name: 'Contingência Alpha - Plano de Emergência', level: 'NÍVEL 6' }
        ];
        
        let hiddenFilesHTML = '<div class="hidden-files-modal"><h3>🔒 ARQUIVOS OCULTOS DO SISTEMA</h3><ul>';
        hiddenFiles.forEach(file => {
            hiddenFilesHTML += `<li><strong>${file.name}</strong> - ${file.level}</li>`;
        });
        hiddenFilesHTML += '</ul><button onclick="this.parentElement.remove()">Fechar</button></div>';
        
        document.body.insertAdjacentHTML('beforeend', hiddenFilesHTML);
    }

    // ===== SISTEMA DE MISSÕES =====
    setupMissions() {
        const missionForm = document.querySelector('.mission-form');
        if (missionForm) {
            missionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createMission();
            });
        }
    }

    createMission() {
        const title = document.getElementById('mission-title').value;
        const description = document.getElementById('mission-description').value;
        const priority = document.getElementById('mission-priority').value;
        const department = document.getElementById('mission-department').value;
        const status = document.getElementById('mission-status').value;

        const newMission = {
            id: Date.now(),
            title: title,
            description: description,
            priority: priority,
            department: department,
            status: status,
            createdBy: this.currentUser.name,
            createdAt: new Date().toISOString()
        };

        this.missions.push(newMission);
        this.saveToStorage('missions', this.missions);
        
        document.querySelector('.mission-form').reset();
        this.loadMissions();
        this.showNotification('Missão criada com sucesso!', 'success');
    }

    loadMissions() {
        const missionsList = document.getElementById('missions-list');
        if (!missionsList) return;

        if (this.missions.length === 0) {
            missionsList.innerHTML = '<p>Nenhuma missão encontrada.</p>';
            return;
        }

        missionsList.innerHTML = this.missions.map(mission => `
            <div class="mission-card">
                <div class="mission-header">
                    <span class="mission-title">${mission.title}</span>
                    <span class="mission-status ${mission.status}">${mission.status}</span>
                </div>
                <p><strong>Descrição:</strong> ${mission.description}</p>
                <p><strong>Prioridade:</strong> ${mission.priority}</p>
                <p><strong>Departamento:</strong> ${mission.department}</p>
                <p><strong>Criado por:</strong> ${mission.createdBy}</p>
                <p><strong>Data:</strong> ${new Date(mission.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
        `).join('');
    }

    // ===== SISTEMA DE SCPs =====
    setupSCPs() {
        const scpForm = document.querySelector('.scp-form');
        if (scpForm) {
            scpForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createSCP();
            });
        }
    }

    createSCP() {
        const name = document.getElementById('scp-name').value;
        const description = document.getElementById('scp-description').value;
        const containment = document.getElementById('scp-containment').value;
        const level = document.getElementById('scp-level').value;

        const newSCP = {
            id: Date.now(),
            name: name,
            description: description,
            containmentProcedure: containment,
            level: parseInt(level),
            isActive: true,
            createdBy: this.currentUser.name,
            createdAt: new Date().toISOString(),
            lastSeen: new Date().toISOString()
        };

        this.scps.push(newSCP);
        this.saveToStorage('scps', this.scps);
        
        document.querySelector('.scp-form').reset();
        this.loadSCPs();
        this.showNotification('SCP registrado com sucesso!', 'success');
    }

    loadSCPs() {
        const scpsList = document.getElementById('scps-list');
        if (!scpsList) return;

        if (this.scps.length === 0) {
            scpsList.innerHTML = '<p>Nenhum SCP encontrado.</p>';
            return;
        }

        scpsList.innerHTML = this.scps.map(scp => `
            <div class="scp-card">
                <div class="scp-header">
                    <span class="scp-name">${scp.name}</span>
                    <span class="scp-level">Nível ${scp.level}</span>
                </div>
                <p><strong>Descrição:</strong> ${scp.description}</p>
                <p><strong>Procedimento de Contenção:</strong> ${scp.containmentProcedure}</p>
                <p><strong>Status:</strong> ${scp.isActive ? 'Ativo' : 'Inativo'}</p>
                <p><strong>Registrado por:</strong> ${scp.createdBy}</p>
                <p><strong>Data de Registro:</strong> ${new Date(scp.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
        `).join('');
    }

    // ===== SISTEMA DE CERTIFICAÇÕES =====
    setupCertifications() {
        const certificationForm = document.querySelector('.certification-form');
        if (certificationForm) {
            certificationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createCertification();
            });
        }
    }

    createCertification() {
        const name = document.getElementById('certification-name').value;
        const description = document.getElementById('certification-description').value;
        const department = document.getElementById('certification-department').value;
        const issuedTo = document.getElementById('certification-issued-to').value;
        const expires = document.getElementById('certification-expires').value;

        const newCertification = {
            id: Date.now(),
            name: name,
            description: description,
            issuedBy: department,
            issuedTo: issuedTo,
            issuedAt: new Date().toISOString(),
            expiresAt: expires,
            isActive: true
        };

        this.certifications.push(newCertification);
        this.saveToStorage('certifications', this.certifications);
        
        document.querySelector('.certification-form').reset();
        this.loadCertifications();
        this.showNotification('Certificação emitida com sucesso!', 'success');
    }

    loadCertifications() {
        const certificationsList = document.getElementById('certifications-list');
        if (!certificationsList) return;

        if (this.certifications.length === 0) {
            certificationsList.innerHTML = '<p>Nenhuma certificação encontrada.</p>';
            return;
        }

        certificationsList.innerHTML = this.certifications.map(cert => `
            <div class="certification-card">
                <div class="certification-header">
                    <span class="certification-name">${cert.name}</span>
                    <span class="certification-status">${cert.isActive ? 'Ativa' : 'Expirada'}</span>
                </div>
                <p><strong>Descrição:</strong> ${cert.description}</p>
                <p><strong>Emitida por:</strong> ${cert.issuedBy}</p>
                <p><strong>Emitida para:</strong> ${cert.issuedTo}</p>
                <p><strong>Data de Emissão:</strong> ${new Date(cert.issuedAt).toLocaleDateString('pt-BR')}</p>
                <p><strong>Data de Expiração:</strong> ${new Date(cert.expiresAt).toLocaleDateString('pt-BR')}</p>
            </div>
        `).join('');
    }
}

// Inicializar o sistema
const scpSystem = new SCPAreaPT9();

// Adicionar estilos CSS para elementos dinâmicos
const additionalStyles = `
    .user-card {
        background: var(--background-dark);
        border: 2px solid var(--border-color);
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .user-info h4 {
        color: var(--primary-color);
        margin-bottom: 0.5rem;
    }

    .user-info p {
        color: var(--text-muted);
        margin-bottom: 0.3rem;
        font-size: 0.9rem;
    }

    .user-actions {
        display: flex;
        gap: 0.5rem;
    }

    .user-actions button {
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
    }

    .doc-content {
        margin-top: 1rem;
        line-height: 1.6;
        color: var(--text-color);
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet); 