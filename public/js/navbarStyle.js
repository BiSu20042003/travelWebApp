function toggleBorder(event,ele){
      event.preventDefault()
      const links= document.querySelectorAll('.innerMost');
      links.forEach(link => link.classList.remove('active'));
      ele.classList.toggle('active');
    }
    function searchPlace(event,ele){
      const divs= document.querySelectorAll('innerSearch');
      divs.forEach(div=>div.classList.remove('active'));
      ele.classList.toggle('active');
    }
    const nav_Bar= document.querySelector('.moveing');
    let isScrolling;
    // let scrollActive= false;
    // let lastScrollY= window.scrollY;

    window.addEventListener("scroll",()=>{
      let currentScroll = window.scrollY;
      // if(currentScroll!==lastScrollY) {
      if(!nav_Bar.classList.contains("shrink")){
      nav_Bar.classList.add("shrink");
      // isShrunk=true;
    }
  
      clearTimeout(isScrolling);
      isScrolling = setTimeout(()=>{
        nav_Bar.classList.remove("shrink");
        // isShrunk=false;
      },2000);
      // lastScrollY=currentScroll
    // }
    });


    const today= new Date().toISOString().split('T')[0];
    document.getElementById("booking-date").setAttribute("min", today);



document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector('input[name="title"]');
  const form = document.querySelector("form.searchBar");

  // Create a suggestion box dynamically
  const suggestionBox = document.createElement("div");
  suggestionBox.setAttribute("id", "suggestions");
  suggestionBox.style.position = "absolute";
  suggestionBox.style.backgroundColor = "#fff";
  suggestionBox.style.border = "1px solid #ccc";
  suggestionBox.style.zIndex = "1000";
  suggestionBox.style.width = input.offsetWidth + "px";
  suggestionBox.style.maxHeight = "200px";
  suggestionBox.style.overflowY = "auto";
  suggestionBox.style.display = "none";
  input.parentNode.appendChild(suggestionBox);

  input.addEventListener("input", async () => {
    const query = input.value.trim();
    if (query.length < 2) {
      suggestionBox.innerHTML = "";
      suggestionBox.style.display = "none";
      return;
    }
  try {
      const res = await fetch(`/search-suggestions?title=${encodeURIComponent(query)}`);
      const data = await res.json();
     suggestionBox.innerHTML = "";
      if (data.length === 0) {
        suggestionBox.style.display = "none";
        return;
      }
      for (const item of data) {
        const div = document.createElement("div");
        div.textContent = item.title;
        div.style.padding = "8px";
        div.style.cursor = "pointer";
        div.addEventListener("mouseover", () => div.style.background = "#f0f0f0");
        div.addEventListener("mouseout", () => div.style.background = "#fff");
        div.onclick = () => {
          input.value = item.title;
          suggestionBox.style.display = "none";
          form.submit(); // Submit the form manually
        };
        suggestionBox.appendChild(div);
      }
      suggestionBox.style.display = "block";
    } catch (err) {
      console.error("Suggestion fetch error:", err);
    }
  });

  // Hide dropdown if clicked outside
  document.addEventListener("click", (e) => {
    if (!suggestionBox.contains(e.target) && e.target !== input) {
      suggestionBox.style.display = "none";
    }
  });
});

function toggleDropdown(){
  const circle = document.getElementById("circle");
  const dropdown = document.getElementById("dropdownBox");
  dropdown.style.position='fixed';
  dropdown.style.top= '15%';
  dropdown.style.left = '30%';
  dropdown.classList.toggle('hidden');
}
document.addEventListener('click',
  function (event){
    const circle = document.getElementById("circle");
    const dropdown = document.getElementById("dropdownBox");
    if(!circle.contains(event.target) && !dropdown.contains(event.target)){
      dropdown.classList.add('hidden')
    }
  }
);
