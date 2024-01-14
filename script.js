let currentSong = new Audio();
let currentSongIndex = 0;
let songs;
let currFolder;


function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);
    let formattedMinutes = String(minutes).padStart(2, '0');
    let formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${currFolder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1]);
        }
    }
    return songs
}


function playMusic(track) {
    if (!currentSong.paused) {
        currentSong.pause();
    }

    let audio = new Audio(`/${currFolder}/` + track);
    currentSong = audio;
    audio.addEventListener("error", (e)=>{
        console.error("error loading audio : ", e)
    })
    

    document.querySelector(".songinfo-2").innerHTML = decodeURI(track);

    let circle2 = document.querySelector('.circle-2');
    audio.addEventListener('timeupdate', () => {
        let currentTime = audio.currentTime;
        let duration = audio.duration;
        let progressPercentage = (currentTime / duration) * 100;
        let circlePosition = (progressPercentage / 100) * (100 - circle2.offsetWidth);
        circle2.style.left = circlePosition + '%';
    });
    let initialLeft = getComputedStyle(circle2).left;
    circle2.style.left = initialLeft;

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
    });

    audio.play();


}

function createSongElement(song) {
    let li = document.createElement("li");
    li.innerHTML = `<img class="invert" src="/img/music_.svg" alt="">
        <div class="songinfo">
            <div>${song.replaceAll("%20", " ")}</div>
            <div>Lazy</div>
        </div>
        <div class="playnow">
            <span>Play now</span>
            <img class="invert" src="img/play_circle.svg" alt="">
        </div>`;
    return li;
}

async function displayAlbums(){
    let a = await fetch(`https://vaghmarelazy.gothub.io/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchers = div.getElementsByTagName("a");
    
    let CardContainer = document.querySelector(".CardContainer")
    
    let array =Array.from(anchers)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            
            
        if(e.href.includes("/songs/")){
            let folder =e.href.split('/').slice(-2)[0]
            //metadata
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();

            CardContainer.innerHTML = CardContainer.innerHTML + `<div data-folder="${folder}" class="card p-1">
            <div class="circle">
              <svg
                class="play-sign"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <img
              class="img-thumbnail"
              src="songs/${folder}/cover.jpg"
              alt=""
            />
            <h3>${response.title}</h3>
            <p>${response.heading}</p>
          </div>`

        }
    }
    //add Event listener For the folders 
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            
            // songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            let folder = item.currentTarget.dataset.folder
            songs = await getsongs(`songs/${folder}`)
            playMusic(songs[0])

            let songsUl = document.querySelector(".songlist").getElementsByTagName("ul")[0];
            songsUl.innerHTML = "";
            songs.forEach(song => {
                let songElement = createSongElement(song);
                songsUl.appendChild(songElement);
            })

        })
    })
}
displayAlbums()


async function main() {

    songs = await getsongs(`songs/Anirudh`);
    playMusic(songs[0], true);

    const NumberOfSongs = songs.length;

    let songsUl = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songs.forEach(song => {
        let songElement = createSongElement(song);
        songsUl.appendChild(songElement);
    });

    // Event delegation for song list
    songsUl.addEventListener("click", (event) => {
        let target = event.target.closest("li");
        if (target) {
            let songName = target.querySelector(".songinfo").firstElementChild.innerHTML.trim();
            playMusic(songName);
        }
    });

    // Add an event listener to seekbar container
    document.querySelector(".seekbar").addEventListener("click", e => {
        if (e.target.classList.contains('circle-2')) return; // Skip if clicked on the circle
        let percent = (e.offsetX / e.currentTarget.getBoundingClientRect().width) * 100;
        document.querySelector(".circle-2").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });


    //Add event listner to the hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    //Close the hamburger
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-200%"
    })

    play.addEventListener("click", () => {
        if (currentSong.paused || currentSong.ended) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play_circle.svg";
        }
    });
    
    //Add Event listner to previous and Next
    let previous = document.getElementById("previous");
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        } else {
            playMusic(songs[songs.length - 1])
        }
    });
    let next = document.getElementById("next")
    next.addEventListener("click", () => {

        let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0])
        if ((index + 1) < NumberOfSongs) {
            playMusic(songs[index + 1])
        }
        else {
            playMusic(songs[0])
        }
    })
}
main();
