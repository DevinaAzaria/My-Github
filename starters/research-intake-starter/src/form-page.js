const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Research Intake Starter</title>
<style>
:root{--bg:#0b0d10;--panel:#12161b;--line:#293039;--text:#f6f7f9;--muted:#a5adb7;--accent:#f3b83f;--max:800px}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,sans-serif;line-height:1.5}
.wrap{width:min(var(--max),92vw);margin:auto}main{padding:64px 0 90px}h1{font-size:clamp(2.5rem,7vw,4.5rem);letter-spacing:-.05em;line-height:.95;margin:12px 0 18px}.intro{color:var(--muted);max-width:680px}
.progress-shell{height:9px;border:1px solid var(--line);background:#151a20;border-radius:999px;overflow:hidden;margin:32px 0 14px}.progress{height:100%;background:var(--accent);width:33.333%;transition:width .2s}
.meta{display:flex;justify-content:space-between;color:var(--muted);font-size:.86rem;margin-bottom:22px}
form{border:1px solid var(--line);border-radius:22px;overflow:hidden;background:var(--panel)}.step{display:none;padding:28px}.step.active{display:block}.field{margin-bottom:22px}.field:last-child{margin-bottom:0}
label{display:block;font-weight:650;margin-bottom:8px}.req:after{content:" *";color:var(--accent)}
input[type=text],textarea{width:100%;border:1px solid var(--line);border-radius:13px;padding:13px 14px;background:#0e1216;color:var(--text);font:inherit}textarea{min-height:120px;resize:vertical}
.check{display:flex;gap:10px;align-items:flex-start}.actions{display:flex;justify-content:space-between;padding:20px 28px;border-top:1px solid var(--line)}button{border:1px solid var(--line);background:#171c22;color:var(--text);border-radius:999px;padding:11px 17px;font:inherit;font-weight:700;cursor:pointer}.primary{background:var(--text);color:#101318}.notice{margin-top:18px;padding:14px 16px;border:1px solid #743f46;border-radius:14px;color:#ffd2d6;display:none}.notice.show{display:block}.hp{position:absolute;left:-10000px;opacity:0}
.success{display:none;border:1px solid var(--line);border-radius:22px;padding:30px;background:var(--panel)}.success.show{display:block}.mono{font-family:ui-monospace,monospace;color:var(--muted)}
</style>
</head>
<body><main><div class="wrap">
<div id="shell">
<div style="color:var(--accent);font-weight:800;letter-spacing:.14em;text-transform:uppercase;font-size:.8rem">Research Intake Starter</div>
<h1>Collect context, not just answers.</h1>
<p class="intro">A minimal reusable pattern for structured research or program intake. Adapt the questions and row mapping to your project.</p>
<div class="progress-shell"><div id="progress" class="progress"></div></div>
<div class="meta"><span id="stepLabel">Step 1 of 3</span><span id="stepName">Context</span></div>

<form id="form" novalidate>
<input class="hp" tabindex="-1" autocomplete="off" name="website">
<input type="hidden" name="startedAt" id="startedAt">

<section class="step active" data-name="Context">
<div class="field"><label class="req" for="participant_name">Participant name / code</label><input type="text" id="participant_name" name="participant_name" required maxlength="120"></div>
<div class="field"><label class="req" for="context">Context</label><textarea id="context" name="context" required maxlength="2500"></textarea></div>
</section>

<section class="step" data-name="Evidence">
<div class="field"><label class="req" for="goal">Goal / research purpose</label><textarea id="goal" name="goal" required maxlength="2500"></textarea></div>
<div class="field"><label class="req" for="observation">Concrete observation</label><textarea id="observation" name="observation" required maxlength="3500"></textarea></div>
<div class="field"><label for="evidence">Existing evidence / artifact</label><textarea id="evidence" name="evidence" maxlength="4000"></textarea></div>
<div class="field"><label for="constraints">Constraints</label><textarea id="constraints" name="constraints" maxlength="2500"></textarea></div>
</section>

<section class="step" data-name="Consent">
<label class="check"><input type="checkbox" name="consent" id="consent" required><span>I understand how this submission will be used for this research/project and consent to submit it.</span></label>
</section>

<div class="actions">
<button id="prev" type="button">← Previous</button>
<div>
<button id="next" class="primary" type="button">Next →</button>
<button id="submit" class="primary" type="submit" style="display:none">Submit</button>
</div>
</div>
</form>
<div id="notice" class="notice"></div>
</div>

<div id="success" class="success">
<h2>Submission received.</h2>
<p>The response was stored successfully.</p>
<div id="recordId" class="mono"></div>
<p><a href="/intake" style="color:inherit">Submit another response</a></p>
</div>
</div></main>

<script>
const steps=[...document.querySelectorAll(".step")];
let current=0;
const form=document.getElementById("form");
const prev=document.getElementById("prev");
const next=document.getElementById("next");
const submit=document.getElementById("submit");
const notice=document.getElementById("notice");
document.getElementById("startedAt").value=Date.now();

function render(){
  steps.forEach((s,i)=>s.classList.toggle("active",i===current));
  document.getElementById("progress").style.width=((current+1)/steps.length*100)+"%";
  document.getElementById("stepLabel").textContent="Step "+(current+1)+" of "+steps.length;
  document.getElementById("stepName").textContent=steps[current].dataset.name;
  prev.disabled=current===0;
  next.style.display=current===steps.length-1?"none":"inline-block";
  submit.style.display=current===steps.length-1?"inline-block":"none";
  notice.className="notice";
}

function valid(){
  for(const el of steps[current].querySelectorAll("[required]")){
    if(!el.checkValidity()){el.reportValidity();return false;}
  }
  return true;
}

prev.onclick=()=>{if(current>0){current--;render();}};
next.onclick=()=>{if(valid()&&current<steps.length-1){current++;render();}};

form.onsubmit=async(e)=>{
  e.preventDefault();
  if(!valid())return;
  submit.disabled=true;
  const data=Object.fromEntries(new FormData(form).entries());
  data.consent=document.getElementById("consent").checked;
  try{
    const res=await fetch("/api/intake",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(data)
    });
    const out=await res.json().catch(()=>({}));
    if(!res.ok)throw new Error(out.message||"Submission failed.");
    document.getElementById("shell").style.display="none";
    document.getElementById("success").classList.add("show");
    document.getElementById("recordId").textContent="Record ID: "+out.record_id;
  }catch(err){
    notice.textContent=err.message||"Submission failed.";
    notice.className="notice show";
    submit.disabled=false;
  }
};
render();
</script>
</body></html>`;

module.exports = page;
