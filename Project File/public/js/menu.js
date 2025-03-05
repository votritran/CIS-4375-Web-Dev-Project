document.getElementById('product-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = {
        product_name: formData.get('product_name'),
        product_price: formData.get('product_price'),
        product_description: formData.get('product_description'),
        product_size: formData.get('product_size'),
        category_name: formData.get('category_name'),
        product_image: formData.get('product_image')
    };

    try {
        const response = await fetch('/menu/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (result.success) {
            alert('Product added successfully!');
            // Optionally, refresh the page or fetch menu items again
            window.location.reload();
        } else {
            alert('Failed to add product: ' + result.message);
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Error adding product');
    }
});
