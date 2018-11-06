import '@babel/polyfill'

import axios from 'axios'
// 로그인 하지 않아도 게시물 읽기는 가능하도록 강사님이 권한을 설정해둠
// 자료 등록, 수정, 삭제는 로그인해야만 가능하게 설정해둠

const api = axios.create({
  // 바깥에서 주입해준  API_URL이라는 환경변수를 사용하는 코드
  // 이 컴퓨터에서만 사용할 환경변수를 설정하기 위해서 .env 파일을 편집하면 된다.
  baseURL: process.env.API_URL
})

api.interceptors.request.use(function (config) {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = 'Bearer ' + token
  }
  return config
});

const templates = {
  loginForm: document.querySelector('#login-form').content,
  postList: document.querySelector('#post-list').content,
  postItem: document.querySelector('#post-item').content,
  postForm: document.querySelector('#post-form').content,
  postDetail: document.querySelector('#post-detail').content,
  commentItem: document.querySelector('#comment-item').content,
}

const rootEl = document.querySelector('.root')

// 페이지 그리는 함수 작성 순서
// 1. 템플릿 복사
// 2. 요소 선택
// 3. 필요한 데이터 불러오기
// 4. 내용 채우기
// 5. 이벤트 리스너 등록하기
// 6. 템플릿을 문서에 삽입

async function drawLoginForm() {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.loginForm, true)

  // 2. 요소 선택
  const formEl = frag.querySelector('.login-form')

  // 3. 필요한 데이터 불러오기 - 필요없음
  // 4. 내용 채우기 - 필요없음
  // 5. 이벤트 리스너 등록하기
  formEl.addEventListener('submit', async e => {
    e.preventDefault()
    const username = e.target.elements.username.value
    const password = e.target.elements.password.value

    const res = await api.post('/users/login', {
      username,
      password
    })

    localStorage.setItem('token', res.data.token)
    drawPostList()
  })

  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = ''
  rootEl.appendChild(frag)
}

async function drawPostList() {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.postList, true)

  // 2. 요소 선택
  //tbody를 선택한 것임
  const listEl = frag.querySelector('.post-list')

  // 3. 필요한 데이터 불러오기
  // 분해대입
  // const {data}:res.data라는 속성을 미리 꺼내와서 넣을 수 있다.
// data라는 속성에 들어있는 값을 꺼내서 postList 라는 속성에 넣은 것이다.

// const res = await api.get("/posts?_embed=user");
// const plstList = res.data
// 를 1줄로 줄여서 씀
  const {data: postList} = await api.get('/posts?_expand=user')

  // 4. 내용 채우기
  // 순회할 때forEach나 for...of 중에 한 가지 쓰면 됨
  for (const postItem of postList) {
    // templates.postItem가져와서 복사하기
    //    <template id="post-item">
    //   <tr class="post-item">
    //     <td class="id"></td>
    //     <td class="title"></td>
    //     <td class="author"></td>
    //   </tr>
    // </template> 가져오는 것임
    const frag = document.importNode(templates.postItem, true)
    const idEl = frag.querySelector('.id')
    const titleEl = frag.querySelector('.title')
    const authorEl = frag.querySelector('.author')

    // 내용 넣어주기
    idEl.textContent = postItem.id
    titleEl.textContent = postItem.title
    authorEl.textContent = postItem.user.username

    // 게시물 제목을 클릭했을 때, drawPostDetail함수가 호출되게 만들기
    titleEl.addEventListener('click', e => {
      drawPostDetail(postItem.id);
    })


    listEl.appendChild(frag);
  }
  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = ''
  rootEl.appendChild(frag)
}

// 게시물을 그려주는 함수
// 그때그때마다 다른 게시물을 표시해주고 싶기 때문에
// 무슨 게시물이 표시되어야 할지 이 함수 입장에서는 알 수 있는 방법이 없기 때문에
// 이 함수를 실행하는 입장에서 매개변수를 postId로 줘서 만듦

async function drawPostDetail(postId) {
  // 1. 템플릿 복사
  // 2. 요소 선택
  // 3. 필요한 데이터 불러오기
  // 4. 내용 채우기
  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입
}

async function drawNewPostForm() {
  // 1. 템플릿 복사
  // 2. 요소 선택
  // 3. 필요한 데이터 불러오기
  // 4. 내용 채우기
  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입
}

async function drawEditPostForm(postId) {
  // 1. 템플릿 복사
  // 2. 요소 선택
  // 3. 필요한 데이터 불러오기
  // 4. 내용 채우기
  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입
}

// 페이지 로드 시 그릴 화면 설정
if (localStorage.getItem('token')) {
  drawPostList()
} else {
  drawLoginForm()
}
