import { redirectToGithubLogin } from '../api/auth'

export function Login() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">로그인</h1>
      <p className="max-w-sm text-gray-600">
        GitHub 계정으로 로그인하면 소유한 저장소 목록을 불러옵니다.
      </p>
      <button
        onClick={redirectToGithubLogin}
        className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-700"
      >
        GitHub로 로그인
      </button>
    </div>
  )
}
