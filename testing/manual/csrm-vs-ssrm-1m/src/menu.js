const frameworks = [
    { name: 'React', path: '/src/react/' },
    { name: 'JavaScript', path: '/src/javascript/' },
    { name: 'Angular', path: '/src/angular/' },
    { name: 'Vue', path: '/src/vue/' },
];

const nav = document.createElement('nav');
nav.id = 'framework-menu';
nav.append(
    ...frameworks.map((fw) => {
        const a = document.createElement('a');
        a.href = fw.path;
        a.textContent = fw.name;
        if (location.pathname === fw.path) {
            a.classList.add('active');
        }
        return a;
    })
);
document.body.prepend(nav);
