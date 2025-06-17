document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const category = button.textContent.toLowerCase().replace(/\s+/g, ''); // ← quita espacios
            filterMenuByCategory(category);
        });
    });

    function filterMenuByCategory(category) {
        const items = document.querySelectorAll('.menu-item');
        items.forEach(item => {
            if (category === 'todos' || item.dataset.category === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
});
