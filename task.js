let tasks = [];
const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const filterOption = document.getElementById('filterOption');
const BASE_URL ="http://localhost:3000/tasks";

function displayTasks() {
    taskList.innerHTML = '';

    fetch(BASE_URL)
    .then(response=>{
        return response.json()
    })
    .then(data=>{
        buildDom(data)
    })
}

function buildDom(data){
    sortedTasks=data
    const filterBy = filterOption.value;
    if (filterBy !== 'all') {
        sortedTasks = sortedTasks.filter(task => task.category === filterBy);
    }

    sortedTasks.forEach(task => {
        const li = document.createElement('li');
        const taskStatus = task.completed ? 'Completed' : 'Pending';
        const taskClass = task.completed ? 'completed' : '';
        li.innerHTML = `<span class="${taskClass}">${task.title} - ${task.category} - Deadline: ${formatDate(task.deadline)}</span>
                        <p>${task.description}</p>
                        <button onclick="editTask(${task.id})">Edit</button>
                        <button onclick="markAsCompleted(${task.id},${task.completed})">${task.completed ? 'Undo' : 'Complete'}</button>
                        <button onclick="deleteTask(${task.id})">Delete</button>`;
        taskList.appendChild(li);
    });
}

function formatDate(datetime) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(datetime).toLocaleDateString('en-US', options);
}

function addTask(event) {
    event.preventDefault();
    const taskTitle = document.getElementById('taskTitle').value;
    const taskDescription = document.getElementById('taskDescription').value;
    const taskCategory = document.getElementById('taskCategory').value;
    const taskDeadline = new Date(document.getElementById('taskDeadline').value);

  //  const newId = tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1;
  let uid=Math.floor(Math.random()*117679)
    uid=uid.toString()
   let itemObject={ id:uid,title: taskTitle, description: taskDescription, category: taskCategory, deadline: taskDeadline, completed: false };
    fetch(BASE_URL,{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify(itemObject)
    })
    .then(response=>{
        return response.json()
    })
    .then(data=>{
        displayTasks()
    })
    taskForm.reset();
    displayTasks();
}

function deleteTask(id) {
   console.log(id)
   fetch(`${BASE_URL}/${id}`,{
    method:'DELETE'
   })
   .then(res=>{
    return res.json()
   })
   .then(data=>{
    displayTasks();
   })

}

// Function to edit task details directly in the UI
function editTask(id) { 

    // Open the modal
    const modal = document.getElementById('editModal');
    modal.style.display = 'block';

    // Fetch current task details
    fetch(`${BASE_URL}/${id}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch task details.');
        }
        return response.json();
    })
    .then(task => {
        // Populate the edit form with current task details
        document.getElementById('editTitle').value = task.title;
        document.getElementById('editDescription').value = task.description;

        // Handle "Save" button click inside the modal
        document.getElementById('saveChanges').addEventListener('click', () => {
            const newTitle = document.getElementById('editTitle').value;
            const newDescription = document.getElementById('editDescription').value;

            // Perform PATCH request to update task
            fetch(`${BASE_URL}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: newTitle, description: newDescription }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update task.');
                }
                return response.json();
            })
            .then(updatedTask => {
                modal.style.display = 'none';
                displayTasks(); // Update the displayed tasks after editing
            })
            .catch(error => {
                console.error('Error updating task:', error);
                // Handle error 
            });
        });

        // Close the modal if the user clicks the close button 
        document.getElementsByClassName('close')[0].addEventListener('click', () => {
            modal.style.display = 'none';
        });
    })
    .catch(error => {
        console.error('Error fetching task details:', error);
        // Handle error 
    });
}





function markAsCompleted(id,status) {
    if(status==true){
    fetch(`${BASE_URL}/${id}`,{
        method:'PATCH',
        body:JSON.stringify({completed:false})
    })
    .then(res=>{
   
    return res.json()
   })
   .then(data=>{
    displayTasks();
   })
    displayTasks();
    }else{
        fetch(`${BASE_URL}/${id}`,{
            method:'PATCH',
            body:JSON.stringify({completed:true})
        })
        .then(res=>{
       
        return res.json()
       })
       .then(data=>{
        displayTasks();
       })
        displayTasks();
    }
}


displayTasks();

taskForm.addEventListener('submit', addTask);
filterOption.addEventListener('change', displayTasks);
