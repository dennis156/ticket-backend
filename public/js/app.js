const pageSize = 8; // Número de registros por página
let currentPage = 1;
let totalPageCount = 0;
let restaurantData = [];

const restaurantTable = document.getElementById('restaurantTable');
const paginationContainer = document.getElementById('pagination');
const form = document.getElementById('myForm');
const btnSendData = document.getElementById('btnSendData');
const OpenDataModal = document.getElementById('OpenDataModal');

function renderTable() {
    // Limpiar la tabla antes de renderizar los datos
    restaurantTable.innerHTML = '';

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentData = restaurantData.slice(startIndex, endIndex);

    currentData.forEach(restaurant => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.innerHTML = restaurant.name;
        row.appendChild(nameCell);

        const boroughCell = document.createElement('td');
        boroughCell.innerHTML = restaurant.borough;
        row.appendChild(boroughCell);

        const cuisineCell = document.createElement('td');
        cuisineCell.innerHTML = restaurant.cuisine;
        row.appendChild(cuisineCell);

        const addressCell = document.createElement('td');
        addressCell.innerHTML =
            `${restaurant.address.building}, ${restaurant.address.street}, ${restaurant.address.zipcode}`;
        row.appendChild(addressCell);

        const gradesCell = document.createElement('td');
        const gradesList = document.createElement('ul');
        restaurant.grades.forEach(grade => {
            const listItem = document.createElement('li');
            listItem.innerHTML =
                `Date: ${grade.date}, Grade: ${grade.grade}, Score: ${grade.score}`;
            gradesList.appendChild(listItem);
        });
        gradesCell.appendChild(gradesList);
        row.appendChild(gradesCell);

        const EditButton = document.createElement('button');
        EditButton.innerHTML = `<i class="fa-solid fa-pen"></i>`;
        EditButton.setAttribute('data-id', restaurant._id);
        row.appendChild(EditButton);
        // Evento click para el botón EditButton
        EditButton.addEventListener('click', () => {
            const restaurantId = EditButton.getAttribute('data-id');
            fetch(`/restaurant/${restaurantId}`)
                .then(res => res.json())
                .then(data => {
                    // Rellenar los campos del formulario de edición con los datos obtenidos
                    document.getElementById('Editbuilding').value = data.address.building;
                    document.getElementById('Editcoord1').value = data.address.coord[0];
                    document.getElementById('Editcoord2').value = data.address.coord[1];
                    document.getElementById('Editstreet').value = data.address.street;
                    document.getElementById('Editzipcode').value = data.address.zipcode;
                    document.getElementById('Editborough').value = data.borough;
                    document.getElementById('Editcuisine').value = data.cuisine;
                    document.getElementById('Editdate').value = data.grades[0].date;
                    document.getElementById('Editgrade').value = data.grades[0].grade;
                    document.getElementById('Editscore').value = data.grades[0].score;
                    document.getElementById('Editname').value = data.name;

                    // Abrir la modal de edición
                    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
                    editModal.show();
                })
                .catch(error => {
                    console.error(error);
                });
            const saveChangesButton = document.getElementById('saveChangesButton');
            saveChangesButton.addEventListener('click', () => {
                // Obtener los datos del formulario de edición
                const building = document.getElementById('Editbuilding').value;
                const coord1 = document.getElementById('Editcoord1').value;
                const coord2 = document.getElementById('Editcoord2').value;
                const street = document.getElementById('Editstreet').value;
                const zipcode = document.getElementById('Editzipcode').value;
                const borough = document.getElementById('Editborough').value;
                const cuisine = document.getElementById('Editcuisine').value;
                const date = document.getElementById('Editdate').value;
                const grade = document.getElementById('Editgrade').value;
                const score = document.getElementById('Editscore').value;
                const name = document.getElementById('Editname').value;

                // Realizar la petición para guardar los cambios
                fetch(`/restaurant/${restaurantId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            address: {
                                building,
                                coord: [coord1, coord2],
                                street,
                                zipcode
                            },
                            borough,
                            cuisine,
                            grades: [{
                                date,
                                grade,
                                score
                            }],
                            name
                        })
                    })
                    .then(res => res.json())
                    .then(data => {
                        // Realizar las acciones necesarias después de guardar los cambios
                        console.log('Cambios guardados:', data);

                        // Cerrar la modal de edición
                        const editModal = new bootstrap.Modal(document.getElementById('editModal'));
                        editModal.hide();
                    })
                    .catch(error => {
                        console.error(error);
                    });
            });
            const modal = document.getElementById('editModal');
            const modalBootstrap = bootstrap.Modal.getInstance(modal);
            modalBootstrap.hide();
        });





        const DeleteButton = document.createElement('button');
        DeleteButton.classList.add('deleteButton');
        DeleteButton.innerHTML = `<i class="fa-solid fa-trash"></i>`;
        DeleteButton.setAttribute('data-id', restaurant._id);
        row.appendChild(DeleteButton);

        DeleteButton.addEventListener('click', function() {
            const restaurantId = restaurant._id;
            DeleteRestaurantDatabase(restaurantId);
        });

        restaurantTable.appendChild(row);
    });

    updatePagination();
}

const DeleteRestaurantDatabase = async(restaurantId) => {
    await fetch(`/restaurant/${restaurantId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(response => {
            // Manejar la respuesta del servidor según sea necesario
            console.log(response);
            renderTable();
        })

    .catch(error => {
        // Manejar cualquier error que ocurra durante la solicitud
        console.error(error);
    });
    // location.reload();
}



function updatePagination() {
    const totalPages = Math.ceil(restaurantData.length / pageSize);
    totalPageCount = totalPages;

    paginationContainer.innerHTML = '';

    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > 5) {
        if (currentPage <= 3) {
            endPage = 5;
        } else if (currentPage >= totalPages - 2) {
            startPage = totalPages - 4;
        } else {
            startPage = currentPage - 2;
            endPage = currentPage + 2;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.addEventListener('click', () => {
            currentPage = i;
            renderTable();
        });

        if (i === currentPage) {
            button.classList.add('active');
        }

        paginationContainer.appendChild(button);
    }

    if (totalPages > 5) {
        if (currentPage >= 4 && currentPage <= totalPages - 3) {
            const dotsStart = document.createElement('span');
            dotsStart.classList.add('dots');
            dotsStart.textContent = '...';
            paginationContainer.insertBefore(dotsStart, paginationContainer.children[1]);

            const dotsEnd = document.createElement('span');
            dotsEnd.classList.add('dots');
            dotsEnd.textContent = '...';
            paginationContainer.insertBefore(dotsEnd, paginationContainer.children[paginationContainer.children
                .length - 1]);
        }
    }

    if (totalPages > 1) {
        const button = document.createElement('button');
        button.textContent = totalPages;
        button.addEventListener('click', () => {
            currentPage = totalPages;
            renderTable();
        });

        if (currentPage === totalPages) {
            button.classList.add('active');
        }

        paginationContainer.appendChild(button);
    }
}

const CreateNewRestaurant = async() => {
    const building = document.getElementById('building').value;
    const coord1 = parseFloat(document.getElementById('coord1').value);
    const coord2 = parseFloat(document.getElementById('coord2').value);
    const street = document.getElementById('street').value;
    const zipcode = document.getElementById('zipcode').value;
    const borough = document.getElementById('borough').value;
    const cuisine = document.getElementById('cuisine').value;
    const date = document.getElementById('date').value;
    const grade = document.getElementById('grade').value;
    const score = parseInt(document.getElementById('score').value);
    const name = document.getElementById('name').value;
    const restaurant_id = Math.random().toString();

    const address = {
        building: building,
        coord: [coord1, coord2],
        street: street,
        zipcode: zipcode
    };

    const grades = [{
        date: date,
        grade: grade,
        score: score
    }];

    const requestData = {
        address: address,
        borough: borough,
        cuisine: cuisine,
        grades: grades,
        name: name,
        restaurant_id: restaurant_id
    };

    try {
        const response = await fetch('/restaurant/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error('Error when creating restaurant');
        }

        // Handle success response here
    } catch (error) {
        // Handle error here
        console.error(error);
    }
    form.reset();
    const modal = document.getElementById('exampleModal');
    const modalBootstrap = bootstrap.Modal.getInstance(modal);
    modalBootstrap.hide();
    renderTable();
};


btnSendData.addEventListener('click', CreateNewRestaurant);
OpenDataModal.addEventListener('click', function() {
    form.reset();
})
fetch('http://localhost:3000/restaurant')
    .then(response => response.json())
    .then(data => {
        restaurantData = data;
        renderTable();
    })
    .catch(error => {
        console.log('Error:', error);
    });