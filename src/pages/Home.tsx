import { Link } from 'react-router-dom'

export function Home() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-3xl font-bold">GitHub 저장소와 Vercel 배포를 한 화면에서</h1>
      <p className="max-w-md text-gray-600">
        여러 저장소를 오가며 배포 상태를 확인하는 번거로움을 줄여드립니다.
      </p>
      <Link
        to="/login"
        className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-700"
      >
        시작하기
      </Link>
    </div>
  )
}
