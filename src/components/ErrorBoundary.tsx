import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

// 렌더링 중 발생한 예외를 잡아 화면 전체가 하얗게 죽는 것을 막는다.
// React 에러 바운더리는 클래스 컴포넌트로만 만들 수 있다(hooks로는 구현 불가).
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReload = () => {
    this.setState({ error: null })
    window.location.reload()
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-lg font-semibold text-gray-900">문제가 발생했습니다</h1>
          <p className="max-w-sm text-sm text-gray-600">
            화면을 표시하는 중 예상치 못한 오류가 발생했습니다. 새로고침해서 다시 시도해주세요.
          </p>
          <button
            onClick={this.handleReload}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
          >
            새로고침
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
