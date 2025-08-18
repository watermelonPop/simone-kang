import { useState, useEffect } from 'react';
import './AboutMeWidget.css';
function AboutMeWidget() {
    //photo
    //name & title
    //desc
        //education: sticky flags, awards & honors: ribbon stickies, 
        // main desc -- notebook paper:
        // main passions, what i'm doing right now, the future
    return (
        <>
        <div className='aboutMeWidgetOuter'>
            <div className='aboutMeTitleDiv'>
                <p className='aboutMeTitle'>About Simone</p>
            </div>
            <div className='aboutMeMainLayout'>
                <div className='aboutMeTopRow'>
                    <div className='aboutMeEducationDiv'>
                        <p className='aboutMeTitles'>Education</p>
                        <div className='sticky-flag'>
                            <p>Texas A&M University (2021-2025): B.S. Computer Science</p>
                        </div>
                        <div className='sticky-flag'>
                            <p>Carnegie Mellon University (2025-2027): M.S. Software Engineering</p>
                        </div>
                    </div>
                    <div className='aboutMeAwardsDiv'>
                        <p className='aboutMeTitles'>Awards & Honors</p>
                        <div className='sticky-flag'>
                        <p>President's Endowed Scholarship</p>
                        </div>
                        <div className='sticky-flag'>
                        <p>Out of State Tuition Waiver</p>
                        </div>
                        <div className='sticky-flag'>
                        <p>Cum Laude graduation honors</p>
                        </div>
                    </div>
                </div>
                <div className='aboutMeBottomRow'>
                    <p>
                        <img className='simonePic' src="/SimonePhoto.JPG"></img> 
                        I’m Simone Kang, and I’m a full-stack software engineer! I’m currently pursuing my Masters in Software Engineering at Carnegie Mellon University with a specialization in scalable systems. Originally from Los Angeles, I completed my undergraduate studies at Texas A&M University in College Station before moving to Pittsburgh for my graduate education. This journey has fostered adaptability, resilience, and a deep appreciation for diverse perspectives. Throughout my academic career, I have honed both my technical and interpersonal skills. My experience as a tutor in computer science, mathematics, and speech and debate for nearly eight years has not only strengthened my technical foundation but also developed my leadership and communication abilities. These experiences, combined with hands-on management roles in academic software projects, have inspired my goal to become a project manager. I thrive in organized, collaborative environments and my competitive spirit, shaped by years of academic and extracurricular pursuits, drives me to deliver high-quality results and continually seek growth. Software engineering is more than just a profession, it’s a source of inspiration and comfort. I’m passionate about leveraging technology to create positive change, and I am excited to contribute to projects that make a meaningful difference, especially in the subject of web accessibility.</p>
                </div>
            </div>
        </div>
        </>
    );
}

export default AboutMeWidget;
