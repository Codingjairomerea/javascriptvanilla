
  const $playlistFriends = document.getElementsByClassName('playlistFriends-item');


(async function getMyPlayList () {
  function myPlayListTemplate (movie) {
    return (
      `            
      <li class="myPlaylist-item">
      <a href="#">
        <span>
          ${movie.title}
        </span>
      </a>
    </li>`
    )
  }
  
  async function getMovie (url){
    const response = await fetch(url);
    const data = await response.json()
    return data.data.movies;
  }
  const movieSuggestList = await getMovie("https://yts.mx/api/v2/list_movies.json?sort=seeds&limit=9");
  const $myPlaylistContainer = document.getElementById("myPlaylist");
  
  movieSuggestList.forEach((movie)=>{
    const HTMLString = myPlayListTemplate(movie);
    const html = document.implementation.createHTMLDocument();
    html.body.innerHTML = HTMLString;
    $myPlaylistContainer.append(html.body.children[0]);
  })
  
  
})();
  
  
  (async function getPlayListFriends () {

    function playlistFriendsTemplate(character) {
      return (
      `<li class="playlistFriends-item">
      <a href="#">
        <img src="${character.picture.thumbnail}" alt="friend's image" />
        <span>
          ${character.name.first} ${character.name.last}
        </span>
      </a>
      </li>`)
    };
    async function getChracter(url) {
      const response = await fetch(url)
      const data = await response.json()
      return data.results;
    }
    const randomNameList = await getChracter("https://randomuser.me/api/?results=8");
    
    const $playlistFriendsContainer = document.getElementById("playlistFriends");
    
    randomNameList.forEach((character)=>{
      const HTMLString = playlistFriendsTemplate(character);
      const html = document.implementation.createHTMLDocument();
      html.body.innerHTML = HTMLString;
      $playlistFriendsContainer.append(html.body.children[0]);
     }
     )
})();



(async function load() {
  // await
  // action
  // terror
  // animation
  async function getData(url) {
    const response = await fetch(url);
    const data = await response.json()
    if (data.data.movie_count > 0){
      return data;
    }
   throw new Error (
    "No se encontró ningun resultado"
    )
  }
  const $form = document.getElementById('form');
  const $home = document.getElementById('home');
  const $featuringContainer = document.getElementById('featuring');

  function setAttributes($element,attributes){
    for (const attribute in attributes) {
      $element.setAttribute(attribute, attributes[attribute]);
    }
  };

  const BASE_API = "https://yts.mx/api/v2/";

  function featuringTemplate(peli) {
    return (
      `      <div class="featuring">
      <div class="featuring-image">
        <img src="${peli.medium_cover_image}" width="70" height="100" alt="">
      </div>
      <div class="featuring-content">
        <p class="featuring-title">Pelicula encontrada</p>
        <p class="featuring-album">${peli.title}</p>
      </div>
    </div>`
    )
  }

  $form.addEventListener("submit", async (event) =>{
    event.preventDefault();
    $home.classList.add("search-active")
    const $loader = document.createElement("img");
    setAttributes($loader, {
      src: "src/images/loader.gif",
      height:50,
      width: 50,
    })
    $featuringContainer.append($loader);
    const data = new FormData($form);
    try {
      const {
        data: {
          movies: pelis
        }
      } = await getData(`${BASE_API}list_movies.json?limit=1&query_term=${data.get("name")}`)
      const HTMLString = featuringTemplate(pelis[0]);
      $featuringContainer.innerHTML = HTMLString;
    } catch (error) {
      alert(error.message);
      $loader.remove();
      $home.classList.remove("search-active")
    }
  })



  function videoItemTemplate(movie, category) {
    return (
      `<div class="primaryPlaylistItem" data-id="${movie.id}"
      data-category="${category}">
        <div class="primaryPlaylistItem-image">
          <img src="${movie.medium_cover_image}">
        </div>
        <h4 class="primaryPlaylistItem-title">
          ${movie.title}
        </h4>
      </div>`
    )
  }
  function createTemplate(HTMLString) {
    const html = document.implementation.createHTMLDocument();
    html.body.innerHTML = HTMLString;
    return html.body.children[0];
  }
  // console.log(videoItemTemplate('src/images/covers/bitcoinjpg', 'bitcoin'));
  function addEventClick($element) {
    $element.addEventListener("click", () =>{
      showModal($element)
    })
  }
  function renderMovieList(list, $container, category) {
    $container.children[0].remove();
    list.forEach((movie) => {
      const HTMLString = videoItemTemplate(movie, category);
      const movieElement = createTemplate(HTMLString);
      $container.append(movieElement);
      const image = movieElement.querySelector("img");
      image.addEventListener("load", (event)=> {
        event.srcElement.classList.add("fadeIn");
      })
      addEventClick(movieElement);
    })
  }
  
  async function cacheExist (list, ctg){
    const cacheList = window.localStorage.getItem(list)
    if (cacheList) {
      return JSON.parse(cacheList);
    }
    const {data:{movies: data}} = await getData(`https://yts.mx/api/v2/list_movies.json?genre=${ctg}`)
    window.localStorage.setItem(list, JSON.stringify(data))
    return data;
  }
  
  const actionList = await cacheExist("actionList", "action")
  const $actionContainer = document.querySelector('#action');
  renderMovieList(actionList, $actionContainer, "action")
  
  const dramaList = await cacheExist("dramaList", "drama")
  const $dramaContainer = document.getElementById('drama');
  renderMovieList(dramaList, $dramaContainer, "drama")
  
  const animationList = await cacheExist("animationList", "animation")
  const $animationContainer = document.getElementById('animation');
  renderMovieList(animationList, $animationContainer, "animation")





  // const $home = $('.home .list #item');
  const $modal = document.getElementById('modal');
  const $overlay = document.getElementById('overlay');
  const $hideModal = document.getElementById('hide-modal');

  const $modalTitle = $modal.querySelector('h1');
  const $modalImage = $modal.querySelector('img');
  const $modalDescription = $modal.querySelector('p');

  function findById(list, id){
    return list.find((movie) => {
      return movie.id === parseInt(id, 10);
    })
  }

  function findMovie(id, category){
    switch(category) {
      case "action": {
        return findById(actionList, id);
      }
      case "drama": {
        return findById(dramaList, id);
      }
      case "animation": {
        return findById(animationList, id);
      }
    }

  }

  function showModal($element) {
    $overlay.classList.add("active");
    $modal.style.animation = "modalIn .8s forwards";
    const id = $element.dataset.id;
    const category = $element.dataset.category;
    const data = findMovie(id, category);
    $modalTitle.textContent = data.title;
    $modalImage.setAttribute("src", data.medium_cover_image);
    $modalDescription.textContent = data.description_full;
  }

  $hideModal.addEventListener("click", hideModal);
  function hideModal(){
    $overlay.classList.remove("active");
    $modal.style.animation = "modalOut .8s forwards"

  }



})()
