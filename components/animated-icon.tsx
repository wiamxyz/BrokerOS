"use client"

import { useEffect, useImperativeHandle, useRef, type ComponentPropsWithRef } from "react"
import type { AnimationItem } from "lottie-web"

export type IconProps = Omit<ComponentPropsWithRef<"svg">, "children"> & { size?: number | string }
export type IconDefinition = { name: string; markup: string; animation?: string; animate?: boolean }

const animationData = new Map<string, Promise<object>>()
function loadAnimationData(path: string) {
  let data = animationData.get(path)
  if (!data) {
    data = fetch(path).then(response => {
      if (!response.ok) throw new Error("Unable to load icon animation")
      return response.json() as Promise<object>
    }).catch(error => { animationData.delete(path); throw error })
    animationData.set(path, data)
  }
  return data
}

export function AnimatedIcon({ definition, ref, size = 24, className = "", ...props }: IconProps & { definition: IconDefinition }) {
  const root = useRef<SVGSVGElement>(null)
  const still = useRef<SVGGElement>(null)
  const motion = useRef<SVGGElement>(null)
  useImperativeHandle(ref, () => root.current!, [])

  useEffect(() => {
    if (definition.animate === false) return
    const svg = root.current!
    const stillFrame = still.current!
    const motionFrame = motion.current!
    const target = svg.closest("button, a, [role='button'], [role='menuitem'], [data-icon-hover]") ?? svg
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const hoverDevice = window.matchMedia("(hover: hover) and (pointer: fine)")
    let player: AnimationItem | undefined
    let pending: Promise<AnimationItem> | undefined
    let disposed = false
    let entered = false
    let visit = 0
    let strokes: Animation[] = []

    const restore = () => {
      player?.goToAndStop(0, true)
      strokes.forEach(animation => animation.cancel())
      strokes = []
      stillFrame.style.visibility = "visible"
      motionFrame.style.visibility = "hidden"
      svg.dataset.motion = "idle"
    }
    const leave = () => { entered = false; visit++; restore() }
    const drawOnce = () => {
      svg.dataset.motion = "playing"
      const shapes = Array.from(stillFrame.querySelectorAll<SVGGeometryElement>("path, line, polyline, polygon, circle, ellipse, rect"))
      strokes = shapes.filter(shape => typeof shape.getTotalLength === "function" && getComputedStyle(shape).stroke !== "none").map(shape => {
        const length = shape.getTotalLength()
        return shape.animate([
          { strokeDasharray: `${length} ${length}`, strokeDashoffset: length },
          { strokeDasharray: `${length} ${length}`, strokeDashoffset: 0 },
        ], { duration: 450, easing: "cubic-bezier(.22,1,.36,1)", iterations: 1 })
      })
      const currentVisit = visit
      void Promise.all(strokes.map(animation => animation.finished)).then(() => {
        if (!disposed && currentVisit === visit) restore()
      }).catch(() => { /* Leaving the control cancels its playback. */ })
    }
    const prepare = () => {
      if (!pending) {
        pending = Promise.all([import("lottie-web"), loadAnimationData(definition.animation!)]).then(([module, data]) => {
          if (disposed) throw new Error("Icon unmounted")
          const animation = module.default.loadAnimation({
            container: motionFrame as unknown as HTMLElement,
            renderer: "svg", loop: false, autoplay: false,
            animationData: structuredClone(data),
            rendererSettings: { viewBoxOnly: true, className: "size-full", focusable: false },
          })
          player = animation
          animation.addEventListener("complete", restore)
          return new Promise<AnimationItem>((resolve, reject) => {
            const ready = () => {
              const nested = motionFrame.querySelector("svg")
              nested?.setAttribute("width", "24")
              nested?.setAttribute("height", "24")
              resolve(animation)
            }
            if (animation.isLoaded) ready()
            else animation.addEventListener("DOMLoaded", ready)
            animation.addEventListener("data_failed", () => reject(new Error("Icon animation failed")))
          })
        }).catch(error => { pending = undefined; throw error })
      }
      return pending
    }
    const enter = async () => {
      if (entered || reducedMotion.matches || !hoverDevice.matches || target.matches(":disabled, [aria-disabled='true']")) return
      entered = true
      const currentVisit = ++visit
      if (!definition.animation) { drawOnce(); return }
      try {
        const animation = await prepare()
        if (disposed || !entered || currentVisit !== visit || reducedMotion.matches) return
        stillFrame.style.visibility = "hidden"
        motionFrame.style.visibility = "visible"
        svg.dataset.motion = "playing"
        animation.goToAndPlay(0, true)
      } catch {
        if (!disposed && entered && currentVisit === visit && !reducedMotion.matches) drawOnce()
      }
    }
    target.addEventListener("pointerenter", enter)
    target.addEventListener("pointerleave", leave)
    reducedMotion.addEventListener("change", leave)
    return () => {
      disposed = true
      leave()
      target.removeEventListener("pointerenter", enter)
      target.removeEventListener("pointerleave", leave)
      reducedMotion.removeEventListener("change", leave)
      player?.destroy()
    }
  }, [definition])

  return <svg ref={root} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className={`iconly-icon ${className}`} data-icon={definition.name} data-motion="idle" {...props}>
    <g ref={still} className="iconly-still" dangerouslySetInnerHTML={{ __html: definition.markup }}/>
    <g ref={motion} className="iconly-motion" style={{ visibility: "hidden" }}/>
  </svg>
}
